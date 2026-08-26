from typing import Dict, Any
from pydantic import BaseModel, Field


class LanguageAssessmentInput(BaseModel):
    letters_correct: int = Field(default=0, ge=0)
    letters_total: int = Field(default=5, ge=1)
    words_correct: int = Field(default=0, ge=0)
    words_total: int = Field(default=5, ge=1)
    paragraph_passed: bool = False
    story_passed: bool = False


class AssessmentInput(BaseModel):
    # Dual Literacy Input
    english: LanguageAssessmentInput = Field(default_factory=LanguageAssessmentInput)
    swahili: LanguageAssessmentInput = Field(default_factory=LanguageAssessmentInput)

    # Numeracy Raw Observations
    single_digit_correct: int = Field(default=0, ge=0)
    single_digit_total: int = Field(default=5, ge=1)
    double_digit_correct: int = Field(default=0, ge=0)
    double_digit_total: int = Field(default=5, ge=1)
    addition_passed: bool = False
    subtraction_passed: bool = False
    multiplication_passed: bool = False
    division_passed: bool = False


class TaRLEvaluationResult(BaseModel):
    english_literacy_level: str
    swahili_literacy_level: str
    numeracy_level: str
    english_summary: str
    swahili_summary: str
    numeracy_summary: str


def evaluate_language_level(assessment: LanguageAssessmentInput) -> str:
    """
    Deterministic TaRL Literacy Progression:
    Story -> Paragraph -> Word -> Letter -> Beginner
    Threshold: >= 80% (e.g., 4/5) on discrete items.
    """
    if assessment.story_passed:
        return "Story"
    if assessment.paragraph_passed:
        return "Paragraph"
    
    if (assessment.words_correct / assessment.words_total) >= 0.8:
        return "Word"
    
    if (assessment.letters_correct / assessment.letters_total) >= 0.8:
        return "Letter"
    
    return "Beginner"


def evaluate_numeracy_level(assessment: AssessmentInput) -> str:
    """
    Deterministic TaRL Numeracy Progression:
    Division -> Multiplication -> Subtraction -> Addition -> 2-Digit -> 1-Digit -> Beginner
    """
    if assessment.division_passed:
        return "Division"
    if assessment.multiplication_passed:
        return "Multiplication"
    if assessment.subtraction_passed:
        return "Subtraction"
    if assessment.addition_passed:
        return "Addition"
    
    if (assessment.double_digit_correct / assessment.double_digit_total) >= 0.8:
        return "2-Digit Number"
    
    if (assessment.single_digit_correct / assessment.single_digit_total) >= 0.8:
        return "1-Digit Number"
    
    return "Beginner"


def evaluate_student_tarl_levels(assessment: AssessmentInput) -> TaRLEvaluationResult:
    eng_level = evaluate_language_level(assessment.english)
    swa_level = evaluate_language_level(assessment.swahili)
    num_level = evaluate_numeracy_level(assessment)
    
    return TaRLEvaluationResult(
        english_literacy_level=eng_level,
        swahili_literacy_level=swa_level,
        numeracy_level=num_level,
        english_summary=f"Letters: {assessment.english.letters_correct}/{assessment.english.letters_total}, Words: {assessment.english.words_correct}/{assessment.english.words_total}, Paragraph: {assessment.english.paragraph_passed}, Story: {assessment.english.story_passed}",
        swahili_summary=f"Letters: {assessment.swahili.letters_correct}/{assessment.swahili.letters_total}, Words: {assessment.swahili.words_correct}/{assessment.swahili.words_total}, Paragraph: {assessment.swahili.paragraph_passed}, Story: {assessment.swahili.story_passed}",
        numeracy_summary=f"1-Digit: {assessment.single_digit_correct}/{assessment.single_digit_total}, 2-Digit: {assessment.double_digit_correct}/{assessment.double_digit_total}, Addition: {assessment.addition_passed}, Subtraction: {assessment.subtraction_passed}"
    )
