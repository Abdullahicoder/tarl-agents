"""Tests for shared memory and the lesson-agent boundary.

The point of these is NOT that Gemini returns JSON. It is that the context
going in is correct and attributable, and that nothing in the lesson path can
change a verified TaRL level.

No network, no Firestore: the repository is a fake built from the same models
Firestore round-trips.
"""

import pytest

from agents.lesson_agent.service import (
    UnknownLevelError,
    build_lesson_prompt,
    curriculum_for,
)
from shared.memory import build_group_context, build_student_context
from shared.models.models import (
    AssessmentRecord,
    AssessmentSource,
    Classroom,
    LiteracyLevel,
    NumeracyLevel,
    Student,
)


class FakeDB:
    """Stands in for FirestoreDB. Returns assessments newest-first, as the
    real repository does via order_by(assessed_at DESCENDING)."""

    def __init__(self, classroom, students, assessments):
        self._classroom = classroom
        self._students = {s.id: s for s in students}
        self._assessments = assessments

    def get_classroom(self, class_id):
        return self._classroom if self._classroom.id == class_id else None

    def get_student(self, student_id):
        return self._students.get(student_id)

    def list_students_in_class(self, class_id):
        return [s for s in self._students.values() if s.class_id == class_id]

    def list_assessments_for_student(self, student_id, limit=25):
        records = [a for a in self._assessments if a.student_id == student_id]
        records.sort(key=lambda a: a.assessed_at, reverse=True)
        return records[:limit]


def _assessment(student_id, assessed_at, *, note=None, final_numeracy=None,
                recommended_numeracy=NumeracyLevel.BEGINNER, summary=None):
    final = final_numeracy or recommended_numeracy
    return AssessmentRecord(
        assessment_id=f"asm_{student_id}_{assessed_at}",
        student_id=student_id,
        class_id="c1",
        assessed_by_uid="teacher-uid",
        assessed_at=assessed_at,
        recommended_english_level=LiteracyLevel.BEGINNER,
        recommended_swahili_level=LiteracyLevel.LETTER,
        recommended_numeracy_level=recommended_numeracy,
        final_english_level=LiteracyLevel.BEGINNER,
        final_swahili_level=LiteracyLevel.LETTER,
        final_numeracy_level=final,
        source=(
            AssessmentSource.TEACHER
            if final != recommended_numeracy
            else AssessmentSource.LEVEL_ENGINE
        ),
        teacher_note=note,
        raw_summary=summary,
    )


@pytest.fixture
def db():
    classroom = Classroom(
        id="c1",
        name="Standard 3 — Mwanza Primary",
        teacher_uids=["y7OmRFzNgFe883Z8v2bBHmz7CUn1"],
        school="Mwanza Primary",
        grade=3,
    )
    students = [
        Student(
            id="s3", name="Zainab", age=7, class_id="c1",
            english_literacy_level=LiteracyLevel.LETTER,
            swahili_literacy_level=LiteracyLevel.LETTER,
            numeracy_level=NumeracyLevel.BEGINNER,
        ),
        Student(
            id="s1", name="Amina", age=8, class_id="c1",
            english_literacy_level=LiteracyLevel.BEGINNER,
            swahili_literacy_level=LiteracyLevel.LETTER,
            numeracy_level=NumeracyLevel.ONE_DIGIT,
        ),
    ]
    assessments = [
        _assessment(
            "s3", "2026-08-20T09:00:00+00:00",
            note="Works best with concrete objects before written numerals.",
            summary="Counts concrete objects reliably; does not read digits.",
        ),
        _assessment("s3", "2026-07-11T09:00:00+00:00"),
        _assessment(
            "s1", "2026-08-21T09:00:00+00:00",
            recommended_numeracy=NumeracyLevel.BEGINNER,
            final_numeracy=NumeracyLevel.ONE_DIGIT,
            note="Knows her digits; froze during the test.",
        ),
    ]
    return FakeDB(classroom, students, assessments)


# ---------------------------------------------------------------------------
# student context
# ---------------------------------------------------------------------------


def test_student_context_carries_verified_levels(db):
    context = build_student_context(db, "s3")
    assert context.current_levels == {
        "english": "Letter",
        "swahili": "Letter",
        "numeracy": "Beginner",
    }


def test_student_context_carries_teacher_note(db):
    context = build_student_context(db, "s3")
    assert any(
        "concrete objects" in (e.teacher_note or "")
        for e in context.recent_assessments
    )


def test_trajectory_previous_level_comes_from_the_second_newest(db):
    context = build_student_context(db, "s3")
    assert context.trajectory.current_numeracy_level == "Beginner"
    assert context.trajectory.previous_numeracy_level == "Beginner"


def test_override_is_visible_in_the_trajectory(db):
    context = build_student_context(db, "s1")
    assert context.trajectory.override_count == 1


def test_unknown_student_raises(db):
    with pytest.raises(ValueError):
        build_student_context(db, "nobody")


# ---------------------------------------------------------------------------
# group context — attribution is the thing that matters
# ---------------------------------------------------------------------------


def _group(db):
    return build_group_context(
        db=db,
        class_id="c1",
        group_name="Counting & number sense",
        subject="numeracy",
        student_ids=["s3", "s1"],
        target_level="Beginner",
    )


def test_every_piece_of_evidence_names_its_student(db):
    context = _group(db)
    assert context.recent_assessment_evidence
    for item in context.recent_assessment_evidence:
        assert item.student_id
        assert item.student_name


def test_teacher_notes_say_who_they_are_about(db):
    """A bare note cannot be acted on. 'Works best with concrete objects' is
    only useful if the teacher knows it describes Zainab."""
    context = _group(db)
    assert any(n.startswith("Zainab: ") for n in context.teacher_notes)
    assert any(n.startswith("Amina: ") for n in context.teacher_notes)


def test_group_context_is_bounded(db):
    context = _group(db)
    assert len(context.recent_assessment_evidence) <= 20
    assert len(context.teacher_notes) <= 10


def test_students_not_in_the_class_are_dropped(db):
    context = build_group_context(
        db=db, class_id="c1", group_name="G", subject="numeracy",
        student_ids=["s3", "s_not_mine"], target_level="Beginner",
    )
    assert [s.student_id for s in context.students] == ["s3"]


# ---------------------------------------------------------------------------
# curriculum lookup — the two traps
# ---------------------------------------------------------------------------


def test_numeracy_lookup_does_not_crash():
    """Regression: the service passed language=None for numeracy, and
    get_level_curriculum calls language.lower() before branching on domain —
    so every numeracy lesson raised AttributeError. Numeracy is the default
    subject on the grouping screen."""
    assert curriculum_for("numeracy", "Beginner").level_name == "Beginner"


@pytest.mark.parametrize("subject", ["english", "swahili"])
def test_literacy_lookup_uses_the_instructional_language(subject):
    curriculum = curriculum_for(subject, "Letter")
    assert curriculum.level_name == "Letter"
    assert curriculum.language == subject


def test_unknown_level_raises_instead_of_silently_teaching_beginner():
    """get_level_curriculum falls back to Beginner for an unknown level. A
    confident Beginner lesson for a Division group is worse than an error."""
    with pytest.raises(UnknownLevelError):
        curriculum_for("numeracy", "Long Division")


# ---------------------------------------------------------------------------
# the prompt — verify what actually goes to the model
# ---------------------------------------------------------------------------


def test_prompt_contains_the_evidence_and_the_note(db):
    prompt = build_lesson_prompt(_group(db))
    assert "Zainab" in prompt
    assert "concrete objects" in prompt
    assert "Counts concrete objects reliably" in prompt


def test_prompt_states_the_target_level_as_authoritative(db):
    prompt = build_lesson_prompt(_group(db))
    assert "VERIFIED TARGET LEVEL" in prompt
    assert "do not change" in prompt


def test_prompt_scopes_to_the_target_level_not_a_higher_one(db):
    """Zainab is Beginner. Nothing about multiplication should reach the model
    as an objective — that is how an agent 'decides' to advance a learner."""
    prompt = build_lesson_prompt(_group(db))
    objectives = prompt.split("CURRICULUM OBJECTIVES")[1]
    assert "multiplication" not in objectives.lower()
    assert "division" not in objectives.lower()


def test_prompt_marks_teacher_notes_as_outranking_the_model(db):
    prompt = build_lesson_prompt(_group(db))
    assert "outrank" in prompt.lower()


def test_the_lesson_path_never_mutates_a_student(db):
    """The agent boundary is read-only. Building the context and the prompt
    must leave every verified level exactly as it was."""
    before = {s.id: s.numeracy_level for s in db.list_students_in_class("c1")}
    build_lesson_prompt(_group(db))
    after = {s.id: s.numeracy_level for s in db.list_students_in_class("c1")}
    assert before == after
