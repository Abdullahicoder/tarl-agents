"""Tests for the deterministic TaRL level engine.

These are the rules the product is built on, so they are pinned here: an LLM
may phrase feedback, but it must never change which level a child is placed at.

Run: pytest tests/
"""

import pytest

from shared.curriculum.levels import get_level_curriculum
from shared.level_engine.engine import (
    evaluate_next_literacy_step,
    evaluate_next_numeracy_step,
)
from shared.level_engine.evaluator import (
    AssessmentInput,
    LanguageAssessmentInput,
    evaluate_language_level,
    evaluate_numeracy_level,
    evaluate_student_tarl_levels,
)
from shared.models.models import (
    LITERACY_ORDER,
    NUMERACY_ORDER,
    AssessmentRecord,
    AssessmentSource,
    LiteracyLevel,
    NumeracyLevel,
    Student,
)


# --------------------------------------------------------------------------
# Literacy: Story -> Paragraph -> Word -> Letter -> Beginner
# --------------------------------------------------------------------------


def test_literacy_defaults_to_beginner():
    assert evaluate_language_level(LanguageAssessmentInput()) is LiteracyLevel.BEGINNER


@pytest.mark.parametrize("correct,expected", [
    (0, LiteracyLevel.BEGINNER),
    (3, LiteracyLevel.BEGINNER),   # 3/5 = 60%, below the 80% threshold
    (4, LiteracyLevel.LETTER),     # 4/5 = 80%, exactly on the threshold
    (5, LiteracyLevel.LETTER),
])
def test_letter_threshold_is_80_percent(correct, expected):
    got = evaluate_language_level(
        LanguageAssessmentInput(letters_correct=correct, letters_total=5)
    )
    assert got is expected


def test_words_outrank_letters():
    got = evaluate_language_level(
        LanguageAssessmentInput(
            letters_correct=5, letters_total=5,
            words_correct=4, words_total=5,
        )
    )
    assert got is LiteracyLevel.WORD


def test_story_is_the_ceiling_and_outranks_everything_below():
    got = evaluate_language_level(
        LanguageAssessmentInput(paragraph_passed=True, story_passed=True)
    )
    assert got is LiteracyLevel.STORY


def test_paragraph_pass_beats_a_perfect_word_score():
    got = evaluate_language_level(
        LanguageAssessmentInput(words_correct=5, words_total=5, paragraph_passed=True)
    )
    assert got is LiteracyLevel.PARAGRAPH


# --------------------------------------------------------------------------
# Numeracy: Division -> Multiplication -> Subtraction -> Addition
#           -> 2-Digit -> 1-Digit -> Beginner
# --------------------------------------------------------------------------


def test_numeracy_defaults_to_beginner():
    assert evaluate_numeracy_level(AssessmentInput()) is NumeracyLevel.BEGINNER


@pytest.mark.parametrize("flags,expected", [
    ({"division_passed": True}, NumeracyLevel.DIVISION),
    ({"multiplication_passed": True}, NumeracyLevel.MULTIPLICATION),
    ({"subtraction_passed": True}, NumeracyLevel.SUBTRACTION),
    ({"addition_passed": True}, NumeracyLevel.ADDITION),
])
def test_operation_precedence(flags, expected):
    assert evaluate_numeracy_level(AssessmentInput(**flags)) is expected


def test_division_outranks_every_lower_operation():
    got = evaluate_numeracy_level(
        AssessmentInput(
            addition_passed=True,
            subtraction_passed=True,
            multiplication_passed=True,
            division_passed=True,
        )
    )
    assert got is NumeracyLevel.DIVISION


@pytest.mark.parametrize("correct,expected", [
    (3, NumeracyLevel.BEGINNER),
    (4, NumeracyLevel.TWO_DIGIT),
])
def test_two_digit_threshold_is_80_percent(correct, expected):
    got = evaluate_numeracy_level(
        AssessmentInput(double_digit_correct=correct, double_digit_total=5)
    )
    assert got is expected


# --------------------------------------------------------------------------
# Taxonomy integrity — this is the regression that was actually shipped
# --------------------------------------------------------------------------


def test_every_engine_output_is_a_valid_student_field():
    """The engine returned '1-Digit Number' while the enum said 'Single Digit',
    so constructing a Student from a result raised ValidationError."""
    result = evaluate_student_tarl_levels(
        AssessmentInput(single_digit_correct=5, single_digit_total=5)
    )
    student = Student(
        id="s1",
        name="Amina",
        age=8,
        english_literacy_level=result.english_literacy_level,
        swahili_literacy_level=result.swahili_literacy_level,
        numeracy_level=result.numeracy_level,
    )
    assert student.numeracy_level is NumeracyLevel.ONE_DIGIT


@pytest.mark.parametrize("level", list(LiteracyLevel))
def test_every_literacy_level_has_curriculum_in_both_languages(level):
    for language in ("english", "swahili"):
        curriculum = get_level_curriculum("literacy", level.value, language=language)
        assert curriculum.level_name == level.value


@pytest.mark.parametrize("level", list(NumeracyLevel))
def test_every_numeracy_level_has_curriculum(level):
    assert get_level_curriculum("numeracy", level.value).level_name == level.value


def test_hierarchies_cover_every_enum_member():
    assert set(LITERACY_ORDER) == set(LiteracyLevel)
    assert set(NUMERACY_ORDER) == set(NumeracyLevel)


# --------------------------------------------------------------------------
# Practice-round nudges
# --------------------------------------------------------------------------


def test_a_strong_round_promotes_one_level_only():
    assert evaluate_next_literacy_step(LiteracyLevel.LETTER, 1.0) is LiteracyLevel.WORD


def test_a_weak_round_demotes_one_level():
    assert evaluate_next_numeracy_step(NumeracyLevel.ADDITION, 0.2) is NumeracyLevel.TWO_DIGIT


def test_nudges_never_fall_off_either_end():
    assert evaluate_next_literacy_step(LiteracyLevel.BEGINNER, 0.0) is LiteracyLevel.BEGINNER
    assert evaluate_next_numeracy_step(NumeracyLevel.DIVISION, 1.0) is NumeracyLevel.DIVISION


def test_a_middling_round_holds_the_level():
    assert evaluate_next_literacy_step(LiteracyLevel.WORD, 0.6) is LiteracyLevel.WORD


# --------------------------------------------------------------------------
# Teacher override bookkeeping
# --------------------------------------------------------------------------


def _record(**overrides):
    base = dict(
        assessment_id="a1",
        student_id="s1",
        class_id="c1",
        assessed_by_uid="uid",
        assessed_at="2026-08-26T00:00:00Z",
        recommended_english_level=LiteracyLevel.WORD,
        recommended_swahili_level=LiteracyLevel.WORD,
        recommended_numeracy_level=NumeracyLevel.ADDITION,
        final_english_level=LiteracyLevel.WORD,
        final_swahili_level=LiteracyLevel.WORD,
        final_numeracy_level=NumeracyLevel.ADDITION,
    )
    base.update(overrides)
    return AssessmentRecord(**base)


def test_accepting_a_recommendation_is_not_an_override():
    assert _record().was_overridden is False


def test_changing_any_final_level_marks_an_override():
    record = _record(
        final_numeracy_level=NumeracyLevel.TWO_DIGIT,
        source=AssessmentSource.TEACHER,
    )
    assert record.was_overridden is True
    assert record.recommended_numeracy_level is NumeracyLevel.ADDITION


def test_student_literacy_level_takes_the_weaker_language():
    student = Student(
        id="s1", name="Amina", age=8,
        english_literacy_level=LiteracyLevel.STORY,
        swahili_literacy_level=LiteracyLevel.LETTER,
    )
    assert student.literacy_level is LiteracyLevel.LETTER
