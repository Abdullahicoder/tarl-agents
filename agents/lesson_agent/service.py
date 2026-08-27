"""Lesson-agent orchestration.

This module prepares the verified TaRL context and invokes Gemini 2.5 Flash.
"""

import json

from google import genai
from google.genai import types

from agents.lesson_agent.agent import LessonPlan, LESSON_INSTRUCTION
from shared.curriculum.levels import get_level_curriculum
from shared.memory import GroupContext


def build_lesson_prompt(context: GroupContext) -> str:
    domain = (
        "numeracy"
        if context.subject.lower() == "numeracy"
        else "literacy"
    )

    language = (
        context.subject.lower()
        if domain == "literacy"
        else None
    )

    curriculum = get_level_curriculum(
        domain,
        context.target_level,
        language=language,
    )

    students = "\n".join(
        (
            f"- {student.name}: "
            f"English={student.english_level}; "
            f"Kiswahili={student.swahili_level}; "
            f"Numeracy={student.numeracy_level}"
        )
        for student in context.students
    ) or "No students listed."

    evidence = "\n".join(
        (
            f"- {item.assessed_at}: "
            f"English={item.final_english_level}; "
            f"Kiswahili={item.final_swahili_level}; "
            f"Numeracy={item.final_numeracy_level}; "
            f"overridden={item.was_overridden}; "
            f"teacher_note={item.teacher_note or 'none'}; "
            f"evidence={item.raw_summary or 'none'}"
        )
        for item in context.recent_assessment_evidence
    ) or "No recent assessment evidence."

    teacher_notes = "\n".join(
        f"- {note}" for note in context.teacher_notes
    ) or "None."

    return f"""
{LESSON_INSTRUCTION}

CLASS
{context.class_name}

GROUP
{context.group_name}

SUBJECT
{context.subject}

VERIFIED TARGET LEVEL
{context.target_level}

STUDENTS
{students}

RECENT ASSESSMENT EVIDENCE
{evidence}

TEACHER NOTES
{teacher_notes}

CURRICULUM OBJECTIVES
{chr(10).join(f"- {x}" for x in curriculum.objectives)}

CURRICULUM SKILLS
{chr(10).join(f"- {x}" for x in curriculum.skills)}

CURRICULUM ACTIVITIES
{chr(10).join(f"- {x}" for x in curriculum.sample_activities)}

Generate the lesson recommendation now.
""".strip()


def generate_lesson_plan(context: GroupContext) -> LessonPlan:
    prompt = build_lesson_prompt(context)

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LessonPlan,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty lesson plan")

    return LessonPlan.model_validate(json.loads(response.text))
