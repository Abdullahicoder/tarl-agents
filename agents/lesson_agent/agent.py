"""TaRL lesson-planning ADK agent.

This module owns the agent DEFINITION only — schema, instruction, and the ADK
`Agent` itself. Orchestration (assembling verified context and running the
agent) lives in `service.py`. Nothing here reaches Firestore or Gemini.

The deterministic TaRL engine and the persisted Student record establish the
authoritative level. This agent only recommends a lesson within it.
"""

from typing import List

from google.adk.agents import Agent
from pydantic import BaseModel, Field

from shared.gemini import MODEL


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

The supplied student and group levels are VERIFIED and AUTHORITATIVE.
Never change, promote, demote, or reinterpret a learner's level. If the
evidence suggests a learner has moved on, say so in `rationale` as something
for the teacher to assess — do not teach above the supplied target level.

Use:
- current verified levels
- recent assessment evidence, which names the learner it describes
- teacher notes and overrides, which outrank any AI recommendation
- the supplied curriculum objectives, skills, and activities

Create a practical, differentiated classroom lesson using low-cost materials
that a teacher in a resource-constrained classroom actually has: bottle tops,
stones, chalk, a yard, their own voice.

The lesson must:
- stay within the supplied TaRL curriculum scope
- respond to the specific assessment evidence, naming learners in
  `differentiation` where the evidence is about one of them
- preserve verified learner levels
- include concrete teacher prompts, phrased as words to say aloud
- include a simple end-of-lesson check the teacher can run without materials

Write in the language of instruction named in SUBJECT. For a Kiswahili
literacy lesson the objectives, activities and teacher prompts must be in
Kiswahili — not an English lesson with a translated title.

Return only the structured LessonPlan.
""".strip()


# `output_schema` is what makes this an ADK agent that returns a LessonPlan
# rather than prose. Without it the declaration is decorative and every caller
# has to re-implement parsing — which is how this module and service.py drifted
# into two different ways of calling the same model.
root_agent = Agent(
    name="lesson_agent",
    model=MODEL,
    description=(
        "Recommends differentiated TaRL lessons from verified "
        "assessment and curriculum context."
    ),
    instruction=LESSON_INSTRUCTION,
    output_schema=LessonPlan,
)
