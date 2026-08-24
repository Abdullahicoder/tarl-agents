from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class LiteracyLevel(str, Enum):
    BEGINNER = "Beginner"
    LETTER = "Letter"
    WORD = "Word"
    PARAGRAPH = "Paragraph"
    STORY = "Story"

class NumeracyLevel(str, Enum):
    BEGINNER = "Beginner"
    SINGLE_DIGIT = "Single Digit"
    DOUBLE_DIGIT = "Double Digit"
    ADDITION = "Addition"
    SUBTRACTION = "Subtraction"
    MULTIPLICATION = "Multiplication"
    DIVISION = "Division"

class Student(BaseModel):
    id: str
    name: str
    age: int
    literacy_level: LiteracyLevel
    numeracy_level: NumeracyLevel
    history: List[dict] = Field(default_factory=list)

class ExerciseResponse(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    hints: List[str] = Field(default_factory=list)
    encouragement: str

class ClassGroup(BaseModel):
    group_name: str
    student_ids: List[str]
    focus_literacy: Optional[str] = None
    focus_numeracy: Optional[str] = None
    rationale: Optional[str] = None
