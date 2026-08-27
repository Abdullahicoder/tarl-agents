import os
import sys

# Add project root directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.models.models import Student, LiteracyLevel, NumeracyLevel
from agents.tutor_agent.agent import generate_targeted_exercise
from agents.classroom_agent.agent import generate_classroom_groups

def run_tests():
    print("=" * 65)
    print(" 🧪 TEST 1: Agent A (Tutor) — Age-Adaptive Tone & Bilingual Check")
    print("=" * 65)

    # 4-year-old Beginner
    preschooler = Student(
        id="s1", name="Amina", age=4, 
        english_literacy_level=LiteracyLevel.BEGINNER, swahili_literacy_level=LiteracyLevel.BEGINNER, 
        numeracy_level=NumeracyLevel.ONE_DIGIT
    )
    print(f"\n[+] Testing Preschooler: {preschooler.name} (Age {preschooler.age}, Level: {preschooler.literacy_level.value})")
    ex1 = generate_targeted_exercise(preschooler, subject="literacy")
    print(f"• Question:      {ex1.question}")
    print(f"• Options:       {ex1.options}")
    print(f"• Hints:         {ex1.hints}")
    print(f"• Encouragement: {ex1.encouragement}\n")

    # 10-year-old Beginner
    older_student = Student(
        id="s2", name="Samuel", age=10, 
        english_literacy_level=LiteracyLevel.BEGINNER, swahili_literacy_level=LiteracyLevel.BEGINNER, 
        numeracy_level=NumeracyLevel.ONE_DIGIT
    )
    print(f"[+] Testing Older Child: {older_student.name} (Age {older_student.age}, Level: {older_student.literacy_level.value})")
    ex2 = generate_targeted_exercise(older_student, subject="literacy")
    print(f"• Question:      {ex2.question}")
    print(f"• Options:       {ex2.options}")
    print(f"• Hints:         {ex2.hints}")
    print(f"• Encouragement: {ex2.encouragement}\n")

    print("=" * 65)
    print(" 🧪 TEST 2: Agent B (Classroom Manager) — TaRL Skill Grouping")
    print("=" * 65)

    cohort = [
        preschooler,
        older_student,
        Student(id="s3", name="Kamau", age=9, english_literacy_level=LiteracyLevel.WORD, swahili_literacy_level=LiteracyLevel.WORD, numeracy_level=NumeracyLevel.ADDITION),
        Student(id="s4", name="Zainab", age=8, english_literacy_level=LiteracyLevel.STORY, swahili_literacy_level=LiteracyLevel.STORY, numeracy_level=NumeracyLevel.DIVISION)
    ]

    print(f"\n[+] Analyzing Cohort of {len(cohort)} Students...")
    result = generate_classroom_groups(cohort)
    print(f"\n[Teacher Summary]:\n{result.teacher_summary}\n")
    for group in result.groups:
        print(f"• {group.group_name} ({group.target_level}): Student IDs {group.student_ids}")
        print(f"  Activities: {group.suggested_activities}\n")

if __name__ == "__main__":
    run_tests()
