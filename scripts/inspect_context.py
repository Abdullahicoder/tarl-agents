"""Print the exact context that reaches Gemini, for one real group.

This is the check that matters. A lesson plan that parses tells you nothing;
what tells you something is reading the evidence going IN and then judging
whether the plan that comes out actually answers it.

    python -m scripts.inspect_context s3 s1
    python -m scripts.inspect_context s3 s1 --prompt

Requires the Firestore composite index on assessments(student_id, assessed_at).
"""

import argparse
import json
import sys

from shared.data_access.firestore_client import FirestoreDB
from shared.memory import build_group_context, build_student_context


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("student_ids", nargs="+")
    parser.add_argument("--class-id", default="c1")
    parser.add_argument("--subject", default="numeracy")
    parser.add_argument("--level", default="Beginner")
    parser.add_argument("--group", default="Counting & number sense")
    parser.add_argument(
        "--prompt",
        action="store_true",
        help="also print the assembled prompt text",
    )
    args = parser.parse_args()

    db = FirestoreDB()

    print("=" * 70)
    print("PER-STUDENT CONTEXT")
    print("=" * 70)
    for student_id in args.student_ids:
        context = build_student_context(db, student_id)
        print(f"\n--- {context.name} ({context.student_id})")
        print(f"  verified levels : {context.current_levels}")
        print(f"  overrides       : {context.trajectory.override_count}")
        print(f"  teacher notes   : {context.trajectory.recent_teacher_notes}")
        print(f"  evidence records: {len(context.recent_assessments)}")
        for item in context.recent_assessments:
            print(
                f"    · {item.assessed_at} "
                f"numeracy={item.final_numeracy_level} "
                f"overridden={item.was_overridden} "
                f"note={item.teacher_note!r}"
            )

    print()
    print("=" * 70)
    print("GROUP CONTEXT — what the lesson agent receives")
    print("=" * 70)
    group = build_group_context(
        db=db,
        class_id=args.class_id,
        group_name=args.group,
        subject=args.subject,
        student_ids=args.student_ids,
        target_level=args.level,
    )
    print(json.dumps(group.model_dump(), indent=2, ensure_ascii=False))

    if args.prompt:
        from agents.lesson_agent.service import build_lesson_prompt

        print()
        print("=" * 70)
        print("PROMPT")
        print("=" * 70)
        print(build_lesson_prompt(group))

    return 0


if __name__ == "__main__":
    sys.exit(main())
