"""Lesson-agent orchestration.

Boundary: this module assembles VERIFIED context and runs the ADK agent
defined in `agent.py`. It is the only place that knows about both Firestore
context and the model. `agent.py` never fetches; routes never prompt.

    saved grouping -> GroupContext -> curriculum -> ADK agent -> LessonPlan

Nothing here can change a learner's level: `target_level` arrives already
verified and is passed through to the curriculum lookup unmodified.
"""

import json
import logging
from typing import Optional

from agents.lesson_agent.agent import LessonPlan, root_agent
from shared.curriculum.levels import get_level_curriculum
from shared.memory import GroupContext

logger = logging.getLogger(__name__)


def _bullets(items) -> str:
    return "\n".join(f"- {item}" for item in items)

APP_NAME = "tarl_lesson_agent"


class UnknownLevelError(ValueError):
    """Raised when target_level is not part of the curriculum taxonomy."""


def curriculum_for(subject: str, target_level: str):
    """Look up curriculum for a verified level.

    Two traps handled here:

    * `get_level_curriculum` calls `language.lower()` before it branches on
      domain, so passing `language=None` for numeracy raises AttributeError.
      Numeracy is the default subject on the grouping screen, so that crashed
      the most common "Build plan" path.
    * It falls back to Beginner for an unrecognised level instead of failing.
      A typo would therefore produce a confident Beginner lesson for a Division
      group, which is worse than an error.
    """
    domain = "numeracy" if subject.lower() == "numeracy" else "literacy"
    language = "english" if domain == "numeracy" else subject.lower()

    curriculum = get_level_curriculum(domain, target_level, language=language)

    if curriculum.level_name != target_level:
        raise UnknownLevelError(f"Unknown {domain} level: {target_level!r}")

    return curriculum


def build_lesson_prompt(context: GroupContext) -> str:
    """The exact text the model sees. Kept pure so a test can assert on it."""
    curriculum = curriculum_for(context.subject, context.target_level)

    students = (
        "\n".join(
            f"- {s.name} (id {s.student_id}): "
            f"English={s.english_level}; "
            f"Kiswahili={s.swahili_level}; "
            f"Numeracy={s.numeracy_level}"
            for s in context.students
        )
        or "No students listed."
    )

    evidence = (
        "\n".join(
            f"- {item.student_name} on {item.assessed_at}: "
            f"English={item.final_english_level}; "
            f"Kiswahili={item.final_swahili_level}; "
            f"Numeracy={item.final_numeracy_level}; "
            f"teacher_overrode_the_engine={item.was_overridden}; "
            f"teacher_note={item.teacher_note or 'none'}; "
            f"observed={item.raw_summary or 'none'}"
            for item in context.recent_assessment_evidence
        )
        or "No recent assessment evidence."
    )

    teacher_notes = "\n".join(f"- {n}" for n in context.teacher_notes) or "None."

    return f"""
CLASS
{context.class_name}

GROUP
{context.group_name}

SUBJECT (language of instruction for literacy)
{context.subject}

VERIFIED TARGET LEVEL — authoritative, do not change
{context.target_level}

STUDENTS
{students}

RECENT ASSESSMENT EVIDENCE
{evidence}

TEACHER NOTES — these outrank any recommendation you would make
{teacher_notes}

CURRICULUM OBJECTIVES — do not exceed this scope
{_bullets(curriculum.objectives)}

CURRICULUM SKILLS
{_bullets(curriculum.skills)}

CURRICULUM ACTIVITIES
{_bullets(curriculum.sample_activities)}

HOW THE TEACHER WILL CHECK
{curriculum.assessment_criteria}

Generate the lesson recommendation now.
""".strip()


def _extract_plan(text: str) -> LessonPlan:
    """Validate the model's output. Never trust it because it parsed."""
    return LessonPlan.model_validate(json.loads(text))


async def generate_lesson_plan(context: GroupContext) -> LessonPlan:
    """Run the ADK lesson agent over verified context.

    NOT VERIFIED IN CI: the ADK runner surface below could not be executed in
    the environment this was written in. If `google.adk` exposes a different
    runner entry point in the pinned 2.x, this function is the only place that
    needs changing — everything else talks to `generate_lesson_plan`.
    """
    from google.adk.runners import InMemoryRunner
    from google.genai import types

    runner = InMemoryRunner(agent=root_agent, app_name=APP_NAME)

    session = await runner.session_service.create_session(
        app_name=APP_NAME,
        user_id="teacher",
    )

    message = types.Content(
        role="user",
        parts=[types.Part(text=build_lesson_prompt(context))],
    )

    final: Optional[str] = None
    async for event in runner.run_async(
        user_id="teacher",
        session_id=session.id,
        new_message=message,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final = event.content.parts[0].text

    if not final:
        raise RuntimeError("Lesson agent returned no content")

    return _extract_plan(final)
