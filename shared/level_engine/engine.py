"""Step a student one level up or down after a practice round.

This is a *nudge* applied to tutoring difficulty, not a TaRL assessment.
Assessment levels come from `shared.level_engine.evaluator`, which is
deterministic and teacher-reviewable; nothing here writes an assessed level.

Both hierarchies are imported from `shared.models.models` so they cannot drift
from the canonical taxonomy — the previous local copy of NUMERACY_HIERARCHY was
missing 2-Digit Number and Multiplication, which made a student jump two levels.
"""

from shared.models.models import (
    LITERACY_ORDER,
    NUMERACY_ORDER,
    LiteracyLevel,
    NumeracyLevel,
)

LITERACY_HIERARCHY = LITERACY_ORDER
NUMERACY_HIERARCHY = NUMERACY_ORDER

PROMOTE_AT = 0.8
DEMOTE_BELOW = 0.4


def _step(hierarchy, current, score):
    idx = hierarchy.index(current)
    if score >= PROMOTE_AT and idx < len(hierarchy) - 1:
        return hierarchy[idx + 1]
    if score < DEMOTE_BELOW and idx > 0:
        return hierarchy[idx - 1]
    return current


def evaluate_next_literacy_step(current_level: LiteracyLevel, score: float) -> LiteracyLevel:
    return _step(LITERACY_HIERARCHY, current_level, score)


def evaluate_next_numeracy_step(current_level: NumeracyLevel, score: float) -> NumeracyLevel:
    return _step(NUMERACY_HIERARCHY, current_level, score)
