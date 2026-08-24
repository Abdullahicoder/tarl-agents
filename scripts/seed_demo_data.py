import json
from shared.models.models import Student, LiteracyLevel, NumeracyLevel

DEMO_STUDENTS = [
    Student(id="s1", name="Amina", age=8, literacy_level=LiteracyLevel.BEGINNER, numeracy_level=NumeracyLevel.SINGLE_DIGIT),
    Student(id="s2", name="Kofi", age=9, literacy_level=LiteracyLevel.WORD, numeracy_level=NumeracyLevel.ADDITION),
    Student(id="s3", name="Zainab", age=7, literacy_level=LiteracyLevel.LETTER, numeracy_level=NumeracyLevel.BEGINNER),
    Student(id="s4", name="Samuel", age=10, literacy_level=LiteracyLevel.STORY, numeracy_level=NumeracyLevel.DIVISION)
]

if __name__ == "__main__":
    print("Demo dataset generated with", len(DEMO_STUDENTS), "students.")
