import logging
from typing import Dict, Any, Optional
from shared.curriculum.levels import get_level_curriculum
from shared.audio_engine.processor import generate_audio_response

logger = logging.getLogger(__name__)


def generate_tutor_prompt(
    student_name: str,
    english_level: str,
    swahili_level: str,
    numeracy_level: str,
    subject: str,
    struggling: bool = False
) -> str:
    subject_clean = subject.lower()
    
    if subject_clean == "english":
        curr = get_level_curriculum("literacy", english_level, language="english")
        domain_desc = f"English Literacy at '{english_level}' level"
    elif subject_clean in ["swahili", "kiswahili"]:
        curr = get_level_curriculum("literacy", swahili_level, language="swahili")
        domain_desc = f"Swahili Literacy at '{swahili_level}' level"
    elif subject_clean == "numeracy":
        curr = get_level_curriculum("numeracy", numeracy_level)
        domain_desc = f"Numeracy at '{numeracy_level}' level"
    else:
        raise ValueError(f"Unsupported subject: {subject}")

    extra_guidance = (
        "\nNOTE: Student is currently struggling with this concept. Provide simpler scaffolding and extra encouragement."
        if struggling else ""
    )

    return f"""You are an empathetic, highly effective Teaching at the Right Level (TaRL) tutor.
Target Student: {student_name}
Subject Scope: {domain_desc}{extra_guidance}

CURRICULUM CONSTRAINTS (DO NOT EXCEED THIS SCOPE):
- Learning Objectives: {', '.join(curr.objectives)}
- Target Skills: {', '.join(curr.skills)}
- Recommended Activities: {', '.join(curr.sample_activities)}

INSTRUCTIONS:
1. Generate an interactive practice activity or lesson tailored specifically for {student_name}.
2. Keep instructions simple, clear, and encouraging.
3. If teaching literacy, stick strictly to vocabulary and structural complexity suitable for the '{curr.level_name}' level.
4. If teaching numeracy, focus strictly on math concepts appropriate for the '{curr.level_name}' level.
"""


async def generate_tutor_lesson(
    student_name: str,
    english_level: str,
    swahili_level: str,
    numeracy_level: str,
    subject: str,
    needs_audio_assistance: bool = False
) -> Dict[str, Any]:
    """
    Generates tutor lessons with token-optimized audio triggers.
    Audio TTS triggers strictly when needs_audio_assistance is True (e.g., student does not understand).
    """
    prompt = generate_tutor_prompt(
        student_name, english_level, swahili_level, numeracy_level, subject, struggling=needs_audio_assistance
    )
    
    audio_payload: Optional[Dict[str, Any]] = None
    
    # Token & Resource Optimization: Only trigger audio output when the student needs extra assistance
    if needs_audio_assistance:
        lang = "swahili" if subject.lower() in ["swahili", "kiswahili"] else "english"
        
        if lang == "swahili":
            audio_text = f"Habari {student_name}, usiwasi. Tutajifunza somo la {subject} pamoja kwa hatua rahisi."
        else:
            audio_text = f"Don't worry {student_name}, let's step through your {subject} lesson together."
            
        audio_payload = await generate_audio_response(
            text=audio_text,
            language=lang
        )

    return {
        "student_name": student_name,
        "subject": subject,
        "evaluated_level": (
            english_level if subject.lower() == "english" 
            else swahili_level if subject.lower() in ["swahili", "kiswahili"] 
            else numeracy_level
        ),
        "prompt_used": prompt,
        "audio_triggered": needs_audio_assistance,
        "audio_payload": audio_payload,
        "status": "ready"
    }
