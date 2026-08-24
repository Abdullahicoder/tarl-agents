from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict

@dataclass
class LevelAssessment:
    assessment_id: str
    subject: str  # "literacy" or "numeracy"
    level: str    # Literacy: Beginner, Letter, Word, Paragraph, Story | Numeracy: Beginner, 1-Digit, 2-Digit, Subtraction, Division
    assessed_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    score: float = 0.0
    evaluator: str = "tutor_agent"  # "tutor_agent" or "teacher"

@dataclass
class Student:
    student_id: str
    name: str
    age: int
    gender: Optional[str] = None
    class_id: str = ""
    literacy_level: str = "Beginner"
    numeracy_level: str = "Beginner"
    assessment_history: List[Dict] = field(default_factory=list)

@dataclass
class ClassGroup:
    group_id: str
    class_id: str
    subject: str
    target_level: str
    student_ids: List[str] = field(default_factory=list)
    assigned_tutor_focus: str = ""
