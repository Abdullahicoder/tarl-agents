from typing import List
from pydantic import BaseModel

class StudentMemoryProfile(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    learning_style_notes: str
    recommended_focus: str

def condense_student_history(history: List[dict], name: str):
    if not history:
        return StudentMemoryProfile(
            strengths=["Baseline assessment started"],
            weaknesses=["Needs further evaluation"],
            learning_style_notes="New student profile",
            recommended_focus="Baseline diagnostic",
        )

    recent = history[-3:]
    notes = [str(x.get("note")) for x in recent if x.get("note")]

    return StudentMemoryProfile(
        strengths=[
            f"Literacy: {recent[-1].get('literacy_level', 'Unknown')}",
            f"Numeracy: {recent[-1].get('numeracy_level', 'Unknown')}",
        ],
        weaknesses=notes[-1:] or ["Continue gathering diagnostic evidence"],
        learning_style_notes=f"{len(recent)} recent diagnostic record(s)",
        recommended_focus="Practice at the student's current TaRL level",
    )
