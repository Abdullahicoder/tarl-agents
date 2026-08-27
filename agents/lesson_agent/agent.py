"""TaRL lesson-planning ADK agent.

The deterministic TaRL engine and persisted Student record establish the
authoritative level. This agent only recommends a lesson from verified context.
"""

from pydantic import BaseModel, Field
from typing import List

from google.adk.agents import Agent


class LessonPlan(BaseModel):
    title: str
    duration_minutes: int = Field(ge=15, le=120)
    objectives: List[str] = Field(min_length=1, max_length=6)
    skills: List[str] = Field(min_length=1, max_length=8)
    activities: List[str] = Field(min_length=1, max_length=8)
    differentiation: List[str] = Field(default_factory=list, max_length=8)
    teacher_prompts: List[str] = Field(default_factory=list, max_length=8)
    assessment_criteria: str
    rationale: str


LESSON_INSTRUCTION = """
You are the TaRL Lesson Planning Agent.

Your job is to recommend a practical lesson for a teacher.

The supplied student/group levels are VERIFIED and AUTHORITATIVE.
Never change, promote, demote, or reinterpret a learner's level.

Use:
- current verified levels
- recent assessment evidence
- teacher notes and overrides
- the supplied curriculum objectives, skills, and activities

Create a practical, differentiated classroom lesson using low-cost materials.

The lesson must:
- stay within the supplied TaRL curriculum scope
- respond to the assessment evidence
- preserve verified learner levels
- include concrete teacher prompts
- include a simple end-of-lesson assessment

Return only the structured LessonPlan.
""".strip()


root_agent = Agent(
    name="lesson_agent",
    model="gemini-2.5-flash",
    description=(
        "Recommends differentiated TaRL lessons from verified "
        "assessment and curriculum context."
    ),
    instruction=LESSON_INSTRUCTION,
)
