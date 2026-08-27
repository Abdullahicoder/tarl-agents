"""Firestore access for classrooms, students, assessments and grouping plans.

Collections:

    classrooms/{class_id}                     Classroom
    students/{student_id}                     Student   (carries class_id)
    assessments/{assessment_id}               AssessmentRecord
    grouping_plans/{plan_id}                  GroupingPlan

Authorization is NOT done here. Callers must have already established that the
requesting teacher owns the classroom — see `assert_teacher_owns_class` in
`deploy/teacher_api.py`. Keeping the check out of this layer means it can never
be accidentally satisfied by a repository default.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from google.cloud import firestore

from shared.models.models import (
    AssessmentRecord,
    Classroom,
    GroupingPlan,
    Student,
    Subject,
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


class FirestoreDB:
    def __init__(self, client: Optional[firestore.Client] = None):
        project_id = os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
        self.db = client or firestore.Client(project=project_id)

    # ---------------------------------------------------------------- classes

    def save_classroom(self, classroom: Classroom) -> Classroom:
        self.db.collection("classrooms").document(classroom.id).set(classroom.model_dump())
        return classroom

    def get_classroom(self, class_id: str) -> Optional[Classroom]:
        doc = self.db.collection("classrooms").document(class_id).get()
        return Classroom(**doc.to_dict()) if doc.exists else None

    def list_classrooms_for_teacher(self, teacher_uid: str) -> List[Classroom]:
        docs = (
            self.db.collection("classrooms")
            .where("teacher_uids", "array_contains", teacher_uid)
            .stream()
        )
        return [Classroom(**doc.to_dict()) for doc in docs]

    # --------------------------------------------------------------- students

    def save_student(self, student: Student) -> Student:
        self.db.collection("students").document(student.id).set(student.model_dump())
        return student

    def get_student(self, student_id: str) -> Optional[Student]:
        doc = self.db.collection("students").document(student_id).get()
        return Student(**doc.to_dict()) if doc.exists else None

    def list_students_in_class(self, class_id: str) -> List[Student]:
        docs = self.db.collection("students").where("class_id", "==", class_id).stream()
        return sorted(
            (Student(**doc.to_dict()) for doc in docs),
            key=lambda s: s.name.lower(),
        )

    # ------------------------------------------------------------ assessments

    def save_assessment(self, record: AssessmentRecord) -> AssessmentRecord:
        self.db.collection("assessments").document(record.assessment_id).set(
            record.model_dump()
        )
        return record

    def list_assessments_for_student(
        self, student_id: str, limit: int = 25
    ) -> List[AssessmentRecord]:
        docs = (
            self.db.collection("assessments")
            .where("student_id", "==", student_id)
            .order_by("assessed_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [AssessmentRecord(**doc.to_dict()) for doc in docs]

    def list_assessments_for_class(
        self, class_id: str, limit: int = 200
    ) -> List[AssessmentRecord]:
        docs = (
            self.db.collection("assessments")
            .where("class_id", "==", class_id)
            .order_by("assessed_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        return [AssessmentRecord(**doc.to_dict()) for doc in docs]

    # --------------------------------------------------------- grouping plans

    def save_grouping_plan(self, plan: GroupingPlan) -> GroupingPlan:
        self.db.collection("grouping_plans").document(plan.plan_id).set(plan.model_dump())
        return plan

    def get_latest_grouping_plan(
        self, class_id: str, subject: Subject
    ) -> Optional[GroupingPlan]:
        docs = list(
            self.db.collection("grouping_plans")
            .where("class_id", "==", class_id)
            .where("subject", "==", subject.value)
            .order_by("generated_at", direction=firestore.Query.DESCENDING)
            .limit(1)
            .stream()
        )
        return GroupingPlan(**docs[0].to_dict()) if docs else None
