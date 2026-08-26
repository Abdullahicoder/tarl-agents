import logging
from shared.level_engine.evaluator import AssessmentInput, evaluate_student_tarl_levels
from shared.audio_engine.processor import transcribe_audio_reading

logger = logging.getLogger(__name__)


async def process_tarl_audio_assessment(
    student_name: str,
    raw_observation: AssessmentInput,
    audio_bytes: bytes = None,
    language: str = "english"
) -> dict:
    transcription_result = None
    if audio_bytes:
        transcription_result = await transcribe_audio_reading(audio_bytes, language=language)
        logger.info(f"Audio transcribed for {student_name}: {transcription_result['transcription']}")

    evaluation = evaluate_student_tarl_levels(raw_observation)

    feedback = (
        f"{student_name} assessed levels: English Literacy '{evaluation.english_literacy_level}', "
        f"Swahili Literacy '{evaluation.swahili_literacy_level}', and Numeracy '{evaluation.numeracy_level}'."
    )
    teacher_action_item = (
        f"Target English practice at '{evaluation.english_literacy_level}', "
        f"Swahili practice at '{evaluation.swahili_literacy_level}', "
        f"and Numeracy at '{evaluation.numeracy_level}'."
    )

    return {
        "student_name": student_name,
        "english_literacy_level": evaluation.english_literacy_level,
        "swahili_literacy_level": evaluation.swahili_literacy_level,
        "numeracy_level": evaluation.numeracy_level,
        "english_summary": evaluation.english_summary,
        "swahili_summary": evaluation.swahili_summary,
        "numeracy_summary": evaluation.numeracy_summary,
        "audio_transcription": transcription_result,
        "llm_feedback": feedback,
        "teacher_action_item": teacher_action_item
    }
