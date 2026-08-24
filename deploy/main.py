import os
import sys
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.models.models import Student, ExerciseResponse, LiteracyLevel, NumeracyLevel
from agents.tutor_agent.agent import generate_targeted_exercise
from agents.classroom_agent.agent import generate_classroom_groups, GroupingRecommendation
from agents.assessment_agent.agent import assess_student_performance, AssessmentResult
from google.cloud import firestore

app = FastAPI(
    title="TaRL Learning Agents API",
    description="Adaptive Swahili-English AI Tutoring, Assessment & Skill Progression Tracker",
    version="1.2.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

db = firestore.Client(project=os.getenv("GCP_PROJECT_ID", "vertical-theory-383513"))

class StudentCreateRequest(BaseModel):
    id: str
    name: str
    age: int
    literacy_level: str
    numeracy_level: str

class AssessmentRequest(BaseModel):
    student_id: str
    test_observation: str

@app.get("/")
def serve_dashboard():
    return FileResponse("static/index.html")

@app.post("/students")
def create_or_update_student(req: StudentCreateRequest):
    try:
        doc_ref = db.collection("students").document(req.id)
        doc = doc_ref.get()
        
        student_data = {
            "id": req.id,
            "name": req.name,
            "age": req.age,
            "literacy_level": req.literacy_level,
            "numeracy_level": req.numeracy_level,
            "history": [{
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "literacy_level": req.literacy_level,
                "numeracy_level": req.numeracy_level,
                "note": "Initial Baseline Registration"
            }]
        }
        
        doc_ref.set(student_data, merge=True)
        return student_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
def list_students():
    try:
        docs = db.collection("students").stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            if "history" not in data:
                data["history"] = []
            results.append(data)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students/{student_id}/progress")
def get_student_progress(student_id: str):
    try:
        doc = db.collection("students").document(student_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Student not found")
        data = doc.to_dict()
        return {
            "id": data.get("id"),
            "name": data.get("name"),
            "history": data.get("history", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tutor/exercise", response_model=ExerciseResponse)
def get_exercise(student_id: str = Query(...), subject: str = Query("literacy")):
    try:
        doc_ref = db.collection("students").document(student_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Student ID '{student_id}' not found.")
        
        student = Student(**doc.to_dict())
        return generate_targeted_exercise(student, subject=subject)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tutor Agent Error: {str(e)}")

@app.post("/assessment/eval", response_model=AssessmentResult)
def evaluate_student(req: AssessmentRequest):
    try:
        doc_ref = db.collection("students").document(req.student_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Student ID '{req.student_id}' not found.")
        
        student_data = doc.to_dict()
        student = Student(**student_data)
        result = assess_student_performance(student, req.test_observation)
        
        history = student_data.get("history", [])
        history.append({
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            "literacy_level": result.recommended_literacy_level.value,
            "numeracy_level": result.recommended_numeracy_level.value,
            "note": req.test_observation[:60] + "..."
        })
        
        doc_ref.update({
            "literacy_level": result.recommended_literacy_level.value,
            "numeracy_level": result.recommended_numeracy_level.value,
            "history": history
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment Agent Error: {str(e)}")

@app.post("/classroom/group", response_model=GroupingRecommendation)
def group_classroom():
    try:
        docs = db.collection("students").stream()
        students = [Student(**doc.to_dict()) for doc in docs]
        if not students:
            raise HTTPException(status_code=400, detail="No students found in database")
        return generate_classroom_groups(students)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classroom Agent Error: {str(e)}")
