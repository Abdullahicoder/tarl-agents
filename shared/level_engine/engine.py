from shared.models.models import LiteracyLevel, NumeracyLevel

LITERACY_HIERARCHY = [
    LiteracyLevel.BEGINNER,
    LiteracyLevel.LETTER,
    LiteracyLevel.WORD,
    LiteracyLevel.PARAGRAPH,
    LiteracyLevel.STORY
]

NUMERACY_HIERARCHY = [
    NumeracyLevel.BEGINNER,
    NumeracyLevel.SINGLE_DIGIT,
    NumeracyLevel.ADDITION,
    NumeracyLevel.SUBTRACTION,
    NumeracyLevel.DIVISION
]

def evaluate_next_literacy_step(current_level: LiteracyLevel, score: float) -> LiteracyLevel:
    idx = LITERACY_HIERARCHY.index(current_level)
    if score >= 0.8 and idx < len(LITERACY_HIERARCHY) - 1:
        return LITERACY_HIERARCHY[idx + 1]
    elif score < 0.4 and idx > 0:
        return LITERACY_HIERARCHY[idx - 1]
    return current_level
