"""Run the lesson agent once, against real Firestore context.

This isolates the one thing tests cannot cover: whether the ADK runner call in
`agents/lesson_agent/service.py` actually executes.

    python -m scripts.try_lesson s3 s1

ADK resolves its own model credentials — it does NOT go through
`shared/gemini.py`, which only covers the direct `google.genai` callers
(classroom and assessment agents). ADK reads a different set of variables, so
set one of these first:

    # Vertex AI (matches how the rest of the project is deployed)
    export GOOGLE_GENAI_USE_VERTEXAI=true
    export GOOGLE_CLOUD_PROJECT=vertical-theory-383513
    export GOOGLE_CLOUD_LOCATION=us-central1

    # or an API key
    export GOOGLE_API_KEY=...

Nothing here writes. The plan is printed and discarded, exactly as the teacher
endpoint treats it before the teacher accepts anything.
"""

import argparse
import asyncio
import json
import sys

from agents.lesson_agent.service import generate_lesson_plan
from shared.data_access.firestore_client import FirestoreDB
from shared.memory import build_group_context


async def run(args) -> int:
    context = build_group_context(
        db=FirestoreDB(),
        class_id=args.class_id,
        group_name=args.group,
        subject=args.subject,
        student_ids=args.student_ids,
        target_level=args.level,
    )

    print(
        f"Calling the lesson agent for {len(context.students)} learners "
        f"with {len(context.recent_assessment_evidence)} evidence records…\n"
    )

    plan = await generate_lesson_plan(context, args.language)

    print(json.dumps(plan.model_dump(), indent=2, ensure_ascii=False))

    # The checks worth making by eye, printed as a reminder rather than
    # asserted — judging whether a lesson answers evidence is not automatable.
    print("\n" + "=" * 70)
    print("READ THE PLAN AGAINST THE EVIDENCE")
    print("=" * 70)
    print(f"  target level was      : {context.target_level}")
    print("  does it stay at that level, or has it drifted upward?")
    for note in context.teacher_notes:
        print(f"  teacher note          : {note}")
    print("  is that note visibly reflected in the activities?")
    print("  does assessment_criteria describe success, not the entry band?")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("student_ids", nargs="+")
    parser.add_argument("--class-id", default="c1")
    parser.add_argument("--subject", default="numeracy")
    parser.add_argument("--level", default="Beginner")
    parser.add_argument("--group", default="Counting & number sense")
    parser.add_argument("--language", default="swahili", choices=["swahili", "english"])
    return asyncio.run(run(parser.parse_args()))


if __name__ == "__main__":
    sys.exit(main())
