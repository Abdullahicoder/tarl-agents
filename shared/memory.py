"""Shared learner memory and agent context.

Firestore is the source of truth.

This module does two related jobs:

1. Memory retrieval:
   - current verified student state
   - recent assessment records
   - teacher overrides and notes

2. Context construction:
   - compact, agent-facing context windows
   - student, group, and class contexts
   - bounded history so prompts do not grow without limit

The LLM never establishes the authoritative TaRL level. The persisted
Student fields and deterministic assessment engine remain authoritative.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from shared.models.models import (
    AssessmentRecord,
    Classroom,
    Student,
)


# ---------------------------------------------------------------------------
# Context schemas
# ---------------------------------------------------------------------------


class AssessmentEvidence(BaseModel):
    assessment_id: str
    assessed_at: str

    recommended_english_level: str
    recommended_swahili_level: str
    recommended_numeracy_level: str

    final_english_level: str
    final_swahili_level: str
    final_numeracy_level: str

    teacher_note: Optional[str] = None
    raw_summary: Optional[str] = None
    was_overridden: bool = False


class LearningTrajectory(BaseModel):
    current_english_level: str
    current_swahili_level: str
    current_numeracy_level: str

    previous_english_level: Optional[str] = None
    previous_swahili_level: Optional[str] = None
    previous_numeracy_level: Optional[str] = None

    override_count: int = 0
    recent_teacher_notes: List[str] = Field(default_factory=list)


class StudentContext(BaseModel):
    student_id: str
    name: str
    age: int
    class_id: str

    current_levels: Dict[str, str]
    trajectory: LearningTrajectory

    recent_assessments: List[AssessmentEvidence] = Field(
        default_factory=list
    )


class GroupStudentContext(BaseModel):
    student_id: str
    name: str
    age: int
    english_level: str
    swahili_level: str
    numeracy_level: str


class GroupContext(BaseModel):
    class_id: str
    class_name: str
    group_name: str
    subject: str

    students: List[GroupStudentContext] = Field(default_factory=list)

    target_level: str
    recent_assessment_evidence: List[AssessmentEvidence] = Field(
        default_factory=list
    )
    teacher_notes: List[str] = Field(default_factory=list)


class ClassContext(BaseModel):
    class_id: str
    class_name: str
    school: Optional[str] = None
    grade: Optional[int] = None

    students: List[GroupStudentContext] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Serialization helpers
# ---------------------------------------------------------------------------


def _level_value(value: Any) -> str:
    """Return enum/string values consistently for prompt-safe context."""
    return value.value if hasattr(value, "value") else str(value)


def _assessment_to_context(record: AssessmentRecord) -> AssessmentEvidence:
    return AssessmentEvidence(
        assessment_id=record.assessment_id,
        assessed_at=record.assessed_at,
        recommended_english_level=_level_value(
            record.recommended_english_level
        ),
        recommended_swahili_level=_level_value(
            record.recommended_swahili_level
        ),
        recommended_numeracy_level=_level_value(
            record.recommended_numeracy_level
        ),
        final_english_level=_level_value(record.final_english_level),
        final_swahili_level=_level_value(record.final_swahili_level),
        final_numeracy_level=_level_value(record.final_numeracy_level),
        teacher_note=record.teacher_note,
        raw_summary=record.raw_summary,
        was_overridden=record.was_overridden,
    )


def _trajectory(
    student: Student,
    assessments: List[AssessmentRecord],
) -> LearningTrajectory:
    current_english = _level_value(student.english_literacy_level)
    current_swahili = _level_value(student.swahili_literacy_level)
    current_numeracy = _level_value(student.numeracy_level)

    # Assessments are expected newest-first from Firestore.
    previous = assessments[1] if len(assessments) > 1 else None

    notes = [
        record.teacher_note
        for record in assessments
        if record.teacher_note
    ]

    return LearningTrajectory(
        current_english_level=current_english,
        current_swahili_level=current_swahili,
        current_numeracy_level=current_numeracy,
        previous_english_level=(
            _level_value(previous.final_english_level)
            if previous
            else None
        ),
        previous_swahili_level=(
            _level_value(previous.final_swahili_level)
            if previous
            else None
        ),
        previous_numeracy_level=(
            _level_value(previous.final_numeracy_level)
            if previous
            else None
        ),
        override_count=sum(
            1 for record in assessments if record.was_overridden
        ),
        recent_teacher_notes=notes[:5],
    )


# ---------------------------------------------------------------------------
# Student memory
# ---------------------------------------------------------------------------


def recent_student_history(
    history: List[dict],
    limit: int = 3,
) -> List[dict]:
    """Legacy helper retained for compatibility with older callers."""
    if not history:
        return []

    return history[-limit:]


def build_student_memory(
    history: List[dict],
    name: str,
) -> Dict[str, Any]:
    """Legacy-compatible memory summary for callers using raw history."""
    recent = recent_student_history(history)

    if not recent:
        return {
            "strengths": ["Baseline assessment started"],
            "weaknesses": ["Needs further evaluation"],
            "learning_style_notes": f"{name} is a new learner",
            "recommended_focus": "Baseline diagnostic",
        }

    latest = recent[-1]

    return {
        "strengths": [
            value
            for value in (
                latest.get("english_literacy_level"),
                latest.get("swahili_literacy_level"),
                latest.get("numeracy_level"),
            )
            if value
        ] or ["Progress has been recorded"],
        "weaknesses": [
            str(item["teacher_note"])
            for item in recent
            if item.get("teacher_note")
        ][-2:] or ["Continue gathering diagnostic evidence"],
        "learning_style_notes": (
            f"{len(recent)} recent diagnostic record(s)"
        ),
        "recommended_focus": (
            latest.get("recommended_focus")
            or "Practice at the current TaRL level"
        ),
    }


def prepare_student_context(
    student: Dict[str, Any],
) -> Dict[str, Any]:
    """Legacy-compatible context builder for non-Firestore callers."""
    history = student.get("history", [])

    return {
        "student_id": student.get("id"),
        "name": student.get("name"),
        "age": student.get("age"),
        "class_id": student.get("class_id", ""),
        "current_levels": {
            "english": student.get("english_literacy_level", "Beginner"),
            "swahili": student.get("swahili_literacy_level", "Beginner"),
            "numeracy": student.get("numeracy_level", "Beginner"),
        },
        "memory": build_student_memory(
            history,
            str(student.get("name", "student")),
        ),
        "recent_history": recent_student_history(history, 3),
    }


# ---------------------------------------------------------------------------
# Firestore-backed context builders
# ---------------------------------------------------------------------------


def build_student_context(
    db: Any,
    student_id: str,
    assessment_limit: int = 5,
) -> StudentContext:
    """Build a compact context window for one student."""
    student = db.get_student(student_id)

    if student is None:
        raise ValueError(f"Student not found: {student_id}")

    assessments = db.list_assessments_for_student(
        student_id,
        limit=assessment_limit,
    )

    return StudentContext(
        student_id=student.id,
        name=student.name,
        age=student.age,
        class_id=student.class_id,
        current_levels={
            "english": _level_value(student.english_literacy_level),
            "swahili": _level_value(student.swahili_literacy_level),
            "numeracy": _level_value(student.numeracy_level),
        },
        trajectory=_trajectory(student, assessments),
        recent_assessments=[
            _assessment_to_context(record)
            for record in assessments
        ],
    )


def build_class_context(
    db: Any,
    class_id: str,
) -> ClassContext:
    """Build context for classroom/grouping agents."""
    classroom = db.get_classroom(class_id)

    if classroom is None:
        raise ValueError(f"Classroom not found: {class_id}")

    students = db.list_students_in_class(class_id)

    return ClassContext(
        class_id=classroom.id,
        class_name=classroom.name,
        school=classroom.school,
        grade=classroom.grade,
        students=[
            GroupStudentContext(
                student_id=student.id,
                name=student.name,
                age=student.age,
                english_level=_level_value(
                    student.english_literacy_level
                ),
                swahili_level=_level_value(
                    student.swahili_literacy_level
                ),
                numeracy_level=_level_value(student.numeracy_level),
            )
            for student in students
        ],
    )


def build_group_context(
    db: Any,
    class_id: str,
    group_name: str,
    subject: str,
    student_ids: List[str],
    target_level: str,
    assessment_limit_per_student: int = 3,
) -> GroupContext:
    """Build the smallest useful lesson-planning context for a group."""
    classroom: Optional[Classroom] = db.get_classroom(class_id)

    if classroom is None:
        raise ValueError(f"Classroom not found: {class_id}")

    students = {
        student.id: student
        for student in db.list_students_in_class(class_id)
    }

    selected = [
        students[student_id]
        for student_id in student_ids
        if student_id in students
    ]

    evidence: List[AssessmentEvidence] = []
    teacher_notes: List[str] = []

    for student in selected:
        records = db.list_assessments_for_student(
            student.id,
            limit=assessment_limit_per_student,
        )

        evidence.extend(
            _assessment_to_context(record)
            for record in records
        )

        teacher_notes.extend(
            record.teacher_note
            for record in records
            if record.teacher_note
        )

    # Most recent evidence first.
    evidence.sort(
        key=lambda item: item.assessed_at,
        reverse=True,
    )

    return GroupContext(
        class_id=class_id,
        class_name=classroom.name,
        group_name=group_name,
        subject=subject,
        target_level=target_level,
        students=[
            GroupStudentContext(
                student_id=student.id,
                name=student.name,
                age=student.age,
                english_level=_level_value(
                    student.english_literacy_level
                ),
                swahili_level=_level_value(
                    student.swahili_literacy_level
                ),
                numeracy_level=_level_value(student.numeracy_level),
            )
            for student in selected
        ],
        recent_assessment_evidence=evidence[:20],
        teacher_notes=list(dict.fromkeys(teacher_notes))[:10],
    )


# ---------------------------------------------------------------------------
# Prompt formatting
# ---------------------------------------------------------------------------


def condense_student_history(student: Any) -> str:
    """Return a compact prompt-safe summary for older agent callers."""
    if hasattr(student, "model_dump"):
        student_dict = student.model_dump()
    elif isinstance(student, dict):
        student_dict = student
    else:
        student_dict = {
            "id": getattr(student, "id", None),
            "name": getattr(student, "name", "Student"),
            "age": getattr(student, "age", None),
            "class_id": getattr(student, "class_id", ""),
            "english_literacy_level": getattr(
                student, "english_literacy_level", "Beginner"
            ),
            "swahili_literacy_level": getattr(
                student, "swahili_literacy_level", "Beginner"
            ),
            "numeracy_level": getattr(
                student, "numeracy_level", "Beginner"
            ),
            "history": getattr(student, "history", []),
        }

    context = prepare_student_context(student_dict)
    levels = context["current_levels"]
    memory = context["memory"]

    return "\n".join(
        [
            f"Student Name: {context.get('name')}",
            f"Age: {context.get('age')}",
            f"English Level: {levels.get('english')}",
            f"Kiswahili Level: {levels.get('swahili')}",
            f"Numeracy Level: {levels.get('numeracy')}",
            f"Strengths: {', '.join(memory.get('strengths', []))}",
            f"Weaknesses: {', '.join(memory.get('weaknesses', []))}",
            f"Recommended Focus: {memory.get('recommended_focus')}",
        ]
    )
