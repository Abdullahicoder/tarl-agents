"""Canonical TaRL domain models.

LEVEL TAXONOMY IS DEFINED HERE AND NOWHERE ELSE.

The enum *values* below are the strings that are written to Firestore, returned
by the API, and rendered by both frontends. They match the deterministic
progression documented in CLAUDE.md section 4 and the curriculum keys in
`shared/curriculum/levels.py`:

    literacy:  Story -> Paragraph -> Word -> Letter -> Beginner
    numeracy:  Division -> Multiplication -> Subtraction -> Addition
               -> 2-Digit Number -> 1-Digit Number -> Beginner

If a level value changes here it must change in `shared/curriculum/levels.py`,
`shared/level_engine/evaluator.py`, `shared/level_engine/engine.py`,
`scripts/seed_demo_data.py` and `src/shared/levels.js` in the same commit.
"""

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
    ONE_DIGIT = "1-Digit Number"
    TWO_DIGIT = "2-Digit Number"
    ADDITION = "Addition"
    SUBTRACTION = "Subtraction"
    MULTIPLICATION = "Multiplication"
    DIVISION = "Division"


LITERACY_ORDER: List[LiteracyLevel] = [
    LiteracyLevel.BEGINNER,
    LiteracyLevel.LETTER,
    LiteracyLevel.WORD,
    LiteracyLevel.PARAGRAPH,
    LiteracyLevel.STORY,
]

NUMERACY_ORDER: List[NumeracyLevel] = [
    NumeracyLevel.BEGINNER,
    NumeracyLevel.ONE_DIGIT,
    NumeracyLevel.TWO_DIGIT,
    NumeracyLevel.ADDITION,
    NumeracyLevel.SUBTRACTION,
    NumeracyLevel.MULTIPLICATION,
    NumeracyLevel.DIVISION,
]


class Subject(str, Enum):
    ENGLISH = "english"
    SWAHILI = "swahili"
    NUMERACY = "numeracy"


class AssessmentSource(str, Enum):
    """Who decided a level. Teacher decisions outrank agent recommendations."""

    LEVEL_ENGINE = "level_engine"
    TUTOR_AGENT = "tutor_agent"
    TEACHER = "teacher"


class AssessmentRecord(BaseModel):
    """One assessment event in a student's history.

    `recommended_*` is what the deterministic engine produced. `final_*` is what
    the teacher accepted or overrode to. They differ exactly when a teacher
    disagreed, which is the signal the classroom agent must not overwrite.
    """

    assessment_id: str
    student_id: str
    class_id: str
    assessed_by_uid: str
    assessed_at: str

    recommended_english_level: LiteracyLevel
    recommended_swahili_level: LiteracyLevel
    recommended_numeracy_level: NumeracyLevel

    final_english_level: LiteracyLevel
    final_swahili_level: LiteracyLevel
    final_numeracy_level: NumeracyLevel

    source: AssessmentSource = AssessmentSource.LEVEL_ENGINE
    teacher_note: Optional[str] = None
    raw_summary: Optional[str] = None

    @property
    def was_overridden(self) -> bool:
        return (
            self.recommended_english_level != self.final_english_level
            or self.recommended_swahili_level != self.final_swahili_level
            or self.recommended_numeracy_level != self.final_numeracy_level
        )


class Student(BaseModel):
    id: str
    name: str
    age: int
    class_id: str = ""

    # Literacy is tracked per language of instruction. The evaluator produces
    # both, so storing a single collapsed level would silently discard one.
    english_literacy_level: LiteracyLevel = LiteracyLevel.BEGINNER
    swahili_literacy_level: LiteracyLevel = LiteracyLevel.BEGINNER
    numeracy_level: NumeracyLevel = NumeracyLevel.BEGINNER

    last_assessed_at: Optional[str] = None
    history: List[dict] = Field(default_factory=list)

    @property
    def literacy_level(self) -> LiteracyLevel:
        """Lower of the two languages — the level a mixed-language group targets."""
        return min(
            self.english_literacy_level,
            self.swahili_literacy_level,
            key=LITERACY_ORDER.index,
        )


class Classroom(BaseModel):
    id: str
    name: str
    teacher_uids: List[str] = Field(default_factory=list)
    school: Optional[str] = None
    grade: Optional[int] = None


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


class GroupingPlan(BaseModel):
    """A saved grouping. `edited_by_teacher` records that a human changed it."""

    plan_id: str
    class_id: str
    subject: Subject
    groups: List[ClassGroup]
    teacher_summary: str = ""
    generated_at: str = ""
    edited_by_teacher: bool = False
