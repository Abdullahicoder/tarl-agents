"""Seed the current TaRL demo classroom into Firestore.

Usage:
    python -m scripts.seed_firestore <TEACHER_UID>

This writes only demo/sample data. It does not create Firebase users or roles.
"""

import sys

from google.cloud import firestore

from scripts.seed_demo_data import DEMO_CLASSROOMS, DEMO_STUDENTS

PROJECT_ID = "vertical-theory-383513"


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.seed_firestore <TEACHER_UID>")
        sys.exit(1)

    teacher_uid = sys.argv[1]

    db = firestore.Client(project=PROJECT_ID)

    classroom = DEMO_CLASSROOMS[0].model_copy(
        update={"teacher_uids": [teacher_uid]}
    )

    print(f"Seeding project: {PROJECT_ID}")
    print(f"Teacher UID: {teacher_uid}")
    print(f"Classroom: {classroom.name}")

    db.collection("classrooms").document(classroom.id).set(
        classroom.model_dump(mode="json")
    )

    for student in DEMO_STUDENTS:
        db.collection("students").document(student.id).set(
            student.model_dump(mode="json")
        )

    print(
        f"Seeded 1 classroom and {len(DEMO_STUDENTS)} students successfully."
    )


if __name__ == "__main__":
    main()
