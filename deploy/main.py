import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List
from shared.models.models import Student, ExerciseResponse
from agents.tutor_agent.agent import generate_targeted_exercise
from agents.classroom_agent.agent import generate_classroom_groups, GroupingRecommendation
from google.cloud import firestore

app = FastAPI(
    title="TaRL Learning Agents API",
    description="Adaptive Swahili-English AI Tutoring & Classroom Grouping Powered by Gemini 2.5 Flash",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory="static"), name="static")

db = firestore.Client(project=os.getenv("GCP_PROJECT_ID", "vertical-theory-383513"))

@app.get("/")
def serve_dashboard():
    return FileResponse("static/index.html")

@app.post("/students", response_model=Student)
def create_or_update_student(student: Student):
    try:
        db.collection("students").document(student.id).set(student.model_dump())
        return student
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students", response_model=List[Student])
def list_students():
    try:
        docs = db.collection("students").stream()
        return [Student(**doc.to_dict()) for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tutor/exercise", response_model=ExerciseResponse)
def get_exercise(student_id: str = Query(...), subject: str = Query("literacy")):
    doc_ref = db.collection("students").document(student_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student = Student(**doc.to_dict())
    return generate_targeted_exercise(student, subject=subject)

@app.post("/classroom/group", response_model=GroupingRecommendation)
def group_classroom():
    try:
        docs = db.collection("students").stream()
        students = [Student(**doc.to_dict()) for doc in docs]
        if not students:
            raise HTTPException(status_code=400, detail="No students found in database")
        return generate_classroom_groups(students)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
