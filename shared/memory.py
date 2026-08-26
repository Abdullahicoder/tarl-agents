# File: shared/memory.py

from typing import Any, Dict, List
from pydantic import BaseModel, Field


class StudentMemoryProfile(BaseModel):
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    learning_style_notes: str = ""
    recommended_focus: str = ""


def recent_student_history(
    history: List[dict],
    limit: int = 3,
) -> List[dict]:
    return history[-limit:] if history else []


def build_student_memory(
    history: List[dict],
    name: str,
) -> StudentMemoryProfile:

    recent = recent_student_history(history)

    if not recent:
        return StudentMemoryProfile(
            strengths=["Baseline assessment started"],
            weaknesses=["Needs further evaluation"],
            learning_style_notes=f"{name} is a new learner",
            recommended_focus="Baseline diagnostic",
        )

    latest = recent[-1]
    strengths = []
    literacy = latest.get("literacy_level")
    numeracy = latest.get("numeracy_level")

    if literacy:
        strengths.append(f"Literacy level: {literacy}")

    if numeracy:
        strengths.append(f"Numeracy level: {numeracy}")

    notes = [
        str(x.get("note"))
        for x in recent
        if x.get("note")
    ]

    return StudentMemoryProfile(
        strengths=strengths or ["Progress has been recorded"],
        weaknesses=notes[-2:] or [
            "Continue gathering diagnostic evidence"
        ],
        learning_style_notes=(
            f"{len(recent)} recent diagnostic record(s)"
        ),
        recommended_focus=(
            latest.get("recommended_focus")
            or "Practice at the current TaRL level"
        ),
    )


def prepare_student_context(
    student: Dict[str, Any],
) -> Dict[str, Any]:

    history = student.get("history", [])

    memory = build_student_memory(
        history,
        str(student.get("name", "student")),
    )

    return {
        "student_id": student.get("id"),
        "name": student.get("name"),
        "age": student.get("age"),
        "literacy_level": student.get("literacy_level"),
        "numeracy_level": student.get("numeracy_level"),
        "memory": memory.model_dump(),
        "recent_history": recent_student_history(history, 3),
    }


def condense_student_history(student: Any) -> str:
    """
    Formats a student's profile and history into a concise text summary 
    for LLM prompt context.
    """
    if hasattr(student, "model_dump"):
        student_dict = student.model_dump()
    elif isinstance(student, dict):
        student_dict = student
    else:
        student_dict = {
            "id": getattr(student, "id", None),
            "name": getattr(student, "name", "Student"),
            "age": getattr(student, "age", None),
            "literacy_level": getattr(student, "literacy_level", None),
            "numeracy_level": getattr(student, "numeracy_level", None),
            "history": getattr(student, "history", []),
        }

    context = prepare_student_context(student_dict)
    memory = context["memory"]
    
    summary_lines = [
        f"Student Name: {context.get('name')}",
        f"Age: {context.get('age')}",
        f"Literacy Level: {context.get('literacy_level')}",
        f"Numeracy Level: {context.get('numeracy_level')}",
        f"Strengths: {', '.join(memory.get('strengths', []))}",
        f"Weaknesses: {', '.join(memory.get('weaknesses', []))}",
        f"Recommended Focus: {memory.get('recommended_focus')}"
    ]
    return "\n".join(summary_lines)
