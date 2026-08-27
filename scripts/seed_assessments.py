"""Seed realistic assessment history for the TaRL showcase."""

from datetime import datetime, timezone, timedelta

from google.cloud import firestore

from shared.models.models import (
    AssessmentRecord,
    AssessmentSource,
    LiteracyLevel,
    NumeracyLevel,
)

PROJECT_ID = "vertical-theory-383513"
CLASS_ID = "c1"
TEACHER_UID = "y7OmRFzNgFe883Z8v2bBHmz7CUn1"


def stamp(days_ago: int) -> str:
    return (
        datetime.now(timezone.utc) - timedelta(days=days_ago)
    ).isoformat()


RECORDS = [
    AssessmentRecord(
        assessment_id="asm_s1_recent",
        student_id="s1",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(1),
        recommended_english_level=LiteracyLevel.BEGINNER,
        recommended_swahili_level=LiteracyLevel.LETTER,
        recommended_numeracy_level=NumeracyLevel.ONE_DIGIT,
        final_english_level=LiteracyLevel.BEGINNER,
        final_swahili_level=LiteracyLevel.LETTER,
        final_numeracy_level=NumeracyLevel.ONE_DIGIT,
        source=AssessmentSource.LEVEL_ENGINE,
        teacher_note="Amina recognizes common letters well but needs more English word practice.",
        raw_summary="Reads familiar letters confidently; beginning transition toward simple words.",
    ),
    AssessmentRecord(
        assessment_id="asm_s6_recent",
        student_id="s6",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(2),
        recommended_english_level=LiteracyLevel.PARAGRAPH,
        recommended_swahili_level=LiteracyLevel.STORY,
        recommended_numeracy_level=NumeracyLevel.MULTIPLICATION,
        final_english_level=LiteracyLevel.PARAGRAPH,
        final_swahili_level=LiteracyLevel.STORY,
        final_numeracy_level=NumeracyLevel.MULTIPLICATION,
        source=AssessmentSource.LEVEL_ENGINE,
        raw_summary="Reads connected text fluently and solves repeated-group multiplication problems.",
    ),
    AssessmentRecord(
        assessment_id="asm_s2_recent",
        student_id="s2",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(3),
        recommended_english_level=LiteracyLevel.WORD,
        recommended_swahili_level=LiteracyLevel.WORD,
        recommended_numeracy_level=NumeracyLevel.ADDITION,
        final_english_level=LiteracyLevel.WORD,
        final_swahili_level=LiteracyLevel.WORD,
        final_numeracy_level=NumeracyLevel.ADDITION,
        source=AssessmentSource.LEVEL_ENGINE,
        raw_summary="Reads familiar words and completes basic addition with concrete support.",
    ),
    AssessmentRecord(
        assessment_id="asm_s5_recent",
        student_id="s5",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(4),
        recommended_english_level=LiteracyLevel.BEGINNER,
        recommended_swahili_level=LiteracyLevel.BEGINNER,
        recommended_numeracy_level=NumeracyLevel.TWO_DIGIT,
        final_english_level=LiteracyLevel.BEGINNER,
        final_swahili_level=LiteracyLevel.BEGINNER,
        final_numeracy_level=NumeracyLevel.TWO_DIGIT,
        source=AssessmentSource.LEVEL_ENGINE,
        teacher_note="Strong with quantities; needs support connecting quantities to written number symbols.",
        raw_summary="Can compare quantities and work with two-digit numbers with guided support.",
    ),
    AssessmentRecord(
        assessment_id="asm_s4_recent",
        student_id="s4",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(5),
        recommended_english_level=LiteracyLevel.STORY,
        recommended_swahili_level=LiteracyLevel.PARAGRAPH,
        recommended_numeracy_level=NumeracyLevel.DIVISION,
        final_english_level=LiteracyLevel.STORY,
        final_swahili_level=LiteracyLevel.PARAGRAPH,
        final_numeracy_level=NumeracyLevel.DIVISION,
        source=AssessmentSource.LEVEL_ENGINE,
        raw_summary="Understands short stories and solves division tasks involving equal groups.",
    ),
    AssessmentRecord(
        assessment_id="asm_s3_recent",
        student_id="s3",
        class_id=CLASS_ID,
        assessed_by_uid=TEACHER_UID,
        assessed_at=stamp(6),
        recommended_english_level=LiteracyLevel.LETTER,
        recommended_swahili_level=LiteracyLevel.LETTER,
        recommended_numeracy_level=NumeracyLevel.BEGINNER,
        final_english_level=LiteracyLevel.LETTER,
        final_swahili_level=LiteracyLevel.LETTER,
        final_numeracy_level=NumeracyLevel.BEGINNER,
        source=AssessmentSource.LEVEL_ENGINE,
        teacher_note="Zainab works best with concrete objects before moving to written numerals.",
        raw_summary="Recognizes several letters and counts concrete objects reliably.",
    ),
]


def main() -> None:
    db = firestore.Client(project=PROJECT_ID)

    for record in RECORDS:
        db.collection("assessments").document(
            record.assessment_id
        ).set(record.model_dump(mode="json"))

    print(f"Seeded {len(RECORDS)} assessment records.")


if __name__ == "__main__":
    main()
