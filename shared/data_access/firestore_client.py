import os
from google.cloud import firestore
from shared.models.models import Student
from typing import List, Optional

class FirestoreDB:
    def __init__ (self):
        project_id = os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
        self.db = firestore.Client(project=project_id)

    def save_student(self, student: Student) -> None:
        self.db.collection("students").document(student.id).set(student.model_dump())

    def get_student(self, student_id: str) -> Optional[Student]:
        doc = self.db.collection("students").document(student_id).get()
        return Student(**doc.to_dict()) if doc.exists else None

    def get_all_students(self) -> List[Student]:
        docs = self.db.collection("students").stream()
        return [Student(**doc.to_dict()) for doc in docs]
