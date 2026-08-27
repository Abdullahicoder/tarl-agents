"""Demo dataset for local development.

Run `python -m scripts.seed_firestore` to write these to Firestore; this module
only builds them so it can be imported by tests without touching GCP.
"""

from shared.models.models import (
    Classroom,
    LiteracyLevel,
    NumeracyLevel,
    Student,
)

DEMO_CLASSROOMS = [
    Classroom(
        id="c1",
        name="Standard 3 — Mwanza Primary",
        teacher_uids=["demo-teacher-uid"],
        school="Mwanza Primary",
        grade=3,
    ),
]

DEMO_STUDENTS = [
    Student(
        id="s1",
        name="Amina",
        age=8,
        class_id="c1",
        english_literacy_level=LiteracyLevel.BEGINNER,
        swahili_literacy_level=LiteracyLevel.LETTER,
        numeracy_level=NumeracyLevel.ONE_DIGIT,
    ),
    Student(
        id="s2",
        name="Kofi",
        age=9,
        class_id="c1",
        english_literacy_level=LiteracyLevel.WORD,
        swahili_literacy_level=LiteracyLevel.WORD,
        numeracy_level=NumeracyLevel.ADDITION,
    ),
    Student(
        id="s3",
        name="Zainab",
        age=7,
        class_id="c1",
        english_literacy_level=LiteracyLevel.LETTER,
        swahili_literacy_level=LiteracyLevel.LETTER,
        numeracy_level=NumeracyLevel.BEGINNER,
    ),
    Student(
        id="s4",
        name="Samuel",
        age=10,
        class_id="c1",
        english_literacy_level=LiteracyLevel.STORY,
        swahili_literacy_level=LiteracyLevel.PARAGRAPH,
        numeracy_level=NumeracyLevel.DIVISION,
    ),
    Student(
        id="s5",
        name="Neema",
        age=8,
        class_id="c1",
        english_literacy_level=LiteracyLevel.BEGINNER,
        swahili_literacy_level=LiteracyLevel.BEGINNER,
        numeracy_level=NumeracyLevel.TWO_DIGIT,
    ),
    Student(
        id="s6",
        name="Baraka",
        age=9,
        class_id="c1",
        english_literacy_level=LiteracyLevel.PARAGRAPH,
        swahili_literacy_level=LiteracyLevel.STORY,
        numeracy_level=NumeracyLevel.MULTIPLICATION,
    ),
]

if __name__ == "__main__":
    print(
        f"Demo dataset: {len(DEMO_CLASSROOMS)} classroom(s), "
        f"{len(DEMO_STUDENTS)} students."
    )
