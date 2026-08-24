from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class LiteracyLevel(str, Enum):
    BEGINNER = "Beginner"
    LETTER = "Letter"
    WORD = "Word"
    PARAGRAPH = "Paragraph"
    STORY = "Story"

class NumeracyLevel(str, Enum):
    BEGINNER = "Beginner"
    SINGLE_DIGIT = "Single Digit"
    ADDITION = "Addition"
    SUBTRACTION = "Subtraction"
    DIVISION = "Division"

class Student(BaseModel):
    id: str
    name: str
    age: int
    literacy_level: LiteracyLevel = LiteracyLevel.BEGINNER
    numeracy_level: NumeracyLevel = NumeracyLevel.BEGINNER
    notes: Optional[str] = ""

class ClassGroup(BaseModel):
    group_name: str
    target_level: str
    student_ids: List[str]
    suggested_activities: List[str]

class ExerciseResponse(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    hints: List[str]
    encouragement: str
