from fastapi import FastAPI, HTTPException
from typing import List
from shared.models.models import Student, ExerciseResponse
from shared.data_access.firestore_client import FirestoreDB
from agents.tutor_agent.agent import generate_targeted_exercise
from agents.classroom_agent.agent import generate_classroom_groups, GroupingRecommendation

app = FastAPI(title="TaRL Agents API", version="1.0.0")
db = FirestoreDB()

@app.get("/")
def health_check():
    return {"status": "ok", "system": "TaRL Multi-Agent Engine"}

@app.post("/students", response_model=Student)
def create_or_update_student(student: Student):
    db.save_student(student)
    return student

@app.get("/students", response_model=List[Student])
def list_students():
    return db.get_all_students()

@app.post("/tutor/exercise", response_model=ExerciseResponse)
def get_exercise(student_id: str, subject: str = "literacy"):
    student = db.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return generate_targeted_exercise(student, subject)

@app.post("/classroom/group", response_model=GroupingRecommendation)
def group_students():
    students = db.get_all_students()
    if not students:
        raise HTTPException(status_code=400, detail="No students found in database to group")
    return generate_classroom_groups(students)
