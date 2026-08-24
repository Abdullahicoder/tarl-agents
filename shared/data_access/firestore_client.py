import os
from google.cloud import firestore
from typing import Optional, Dict

class FirestoreManager:
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
        self.db = firestore.Client(project=self.project_id)

    def save_student(self, student_data: Dict) -> None:
        student_id = student_data.get("student_id")
        if not student_id:
            raise ValueError("student_id is required")
        self.db.collection("students").document(student_id).set(student_data, merge=True)

    def get_student(self, student_id: str) -> Optional[Dict]:
        doc = self.db.collection("students").document(student_id).get()
        return doc.to_dict() if doc.exists else None

    def update_student_level(self, student_id: str, subject: str, new_level: str) -> None:
        field_to_update = "literacy_level" if subject == "literacy" else "numeracy_level"
        self.db.collection("students").document(student_id).update({
            field_to_update: new_level
        })
