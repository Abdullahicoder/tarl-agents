import os
import sys
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from google.cloud import firestore

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared.models.models import Student, ExerciseResponse
from agents.tutor_agent.agent import generate_targeted_exercise
from agents.assessment_agent.agent import (
    assess_student_performance,
    AssessmentResult,
)
from agents.classroom_agent.agent import (
    generate_classroom_groups,
    GroupingRecommendation,
)

app = FastAPI(title="TaRL Learning Agents API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = None

def get_db():
    global db
    if db is None:
        db = firestore.Client(
            project=os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
        )
    return db

class AssessmentRequest(BaseModel):
    student_id: str
    test_observation: str

@app.get("/")
def root():
    path = os.path.join(os.path.dirname(__file__), "..", "static", "index.html")
    if os.path.exists(path):
        return FileResponse(path)
    return {"service": "TaRL Learning Agents API", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/students")
def list_students():
    return [
        doc.to_dict()
        for doc in get_db().collection("students").stream()
    ]

@app.get("/students/{student_id}/progress")
def get_student_progress(student_id: str):
    doc = get_db().collection("students").document(student_id).get()

    if not doc.exists:
        raise HTTPException(404, "Student not found")

    data = doc.to_dict()

    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "history": data.get("history", []),
    }

@app.post("/tutor/exercise", response_model=ExerciseResponse)
def get_exercise(
    student_id: str = Query(...),
    subject: str = Query("literacy"),
):
    doc = get_db().collection("students").document(student_id).get()

    if not doc.exists:
        raise HTTPException(404, f"Student ID '{student_id}' not found.")

    return generate_targeted_exercise(
        Student(**doc.to_dict()),
        subject=subject,
    )

@app.post("/assessment/eval", response_model=AssessmentResult)
def evaluate_student(req: AssessmentRequest):
    ref = get_db().collection("students").document(req.student_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, f"Student ID '{req.student_id}' not found.")

    data = doc.to_dict()
    student = Student(**data)

    result = assess_student_performance(
        student,
        req.test_observation,
    )

    history = data.get("history", [])

    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "literacy_level": result.recommended_literacy_level.value,
        "numeracy_level": result.recommended_numeracy_level.value,
        "note": req.test_observation[:120],
    })

    ref.update({
        "literacy_level": result.recommended_literacy_level.value,
        "numeracy_level": result.recommended_numeracy_level.value,
        "history": history[-20:],
    })

    return result

@app.post("/classroom/group", response_model=GroupingRecommendation)
def group_classroom():
    docs = get_db().collection("students").stream()

    students = [
        Student(**doc.to_dict())
        for doc in docs
    ]

    if not students:
        raise HTTPException(400, "No students found in database")

    return generate_classroom_groups(students)
