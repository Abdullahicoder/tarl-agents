"""Teacher-facing API.

Every route here requires a Firebase ID token whose role is `teacher` or
`admin`, AND that the teacher is listed on the classroom being touched.
Role alone is not enough: without the ownership check, any teacher in the
deployment could read any classroom by guessing an id.

Product rule enforced by these contracts: **AI recommends, teachers decide.**
`POST /teacher/classes/{class_id}/grouping/generate` and
`POST /teacher/students/{student_id}/assessments/recommend` never write. The
only routes that persist a decision take the teacher's chosen values in the
request body.
"""

import asyncio
import logging
from functools import lru_cache
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from agents.classroom_agent.agent import generate_classroom_groups
from agents.lesson_agent.agent import LessonPlan
from agents.lesson_agent.service import (
    UnknownLevelError,
    curriculum_for,
    generate_lesson_plan,
)
from shared.auth.dependencies import require_teacher
from shared.memory import build_group_context
from shared.data_access.firestore_client import FirestoreDB, new_id, utc_now
from shared.level_engine.evaluator import AssessmentInput, evaluate_student_tarl_levels
from shared.models.models import (
    LITERACY_ORDER,
    NUMERACY_ORDER,
    AssessmentRecord,
    AssessmentSource,
    ClassGroup,
    Classroom,
    GroupingPlan,
    LiteracyLevel,
    NumeracyLevel,
    Student,
    Subject,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/teacher", tags=["teacher"])


@lru_cache(maxsize=1)
def get_db() -> FirestoreDB:
    return FirestoreDB()


# ---------------------------------------------------------------------------
# authorization helpers
# ---------------------------------------------------------------------------


def teacher_uid(user: Dict[str, Any]) -> str:
    uid = user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token carries no uid",
        )
    return uid


def assert_teacher_owns_class(user: Dict[str, Any], class_id: str) -> Classroom:
    """Ownership gate for every class-scoped route.

    Returns 404 rather than 403 for a classroom the caller does not own, so the
    API does not confirm that an unowned class_id exists.
    """
    classroom = get_db().get_classroom(class_id)
    uid = teacher_uid(user)
    is_admin = user.get("role") == "admin"

    if classroom is None or (not is_admin and uid not in classroom.teacher_uids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found",
        )
    return classroom


def assert_teacher_owns_student(user: Dict[str, Any], student_id: str) -> Student:
    student = get_db().get_student(student_id)
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    assert_teacher_owns_class(user, student.class_id)
    return student


# ---------------------------------------------------------------------------
# request / response bodies
# ---------------------------------------------------------------------------


class ClassroomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    school: Optional[str] = None
    grade: Optional[int] = Field(default=None, ge=1, le=12)


class StudentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    age: int = Field(ge=3, le=25)
    english_literacy_level: LiteracyLevel = LiteracyLevel.BEGINNER
    swahili_literacy_level: LiteracyLevel = LiteracyLevel.BEGINNER
    numeracy_level: NumeracyLevel = NumeracyLevel.BEGINNER


class AssessmentRecommendation(BaseModel):
    """What the deterministic engine proposes. Nothing is written yet."""

    student_id: str
    recommended_english_level: LiteracyLevel
    recommended_swahili_level: LiteracyLevel
    recommended_numeracy_level: NumeracyLevel
    english_summary: str
    swahili_summary: str
    numeracy_summary: str
    teacher_action_item: str


class AssessmentDecision(BaseModel):
    """What the teacher decided. `final_*` may differ from the recommendation."""

    raw: AssessmentInput
    final_english_level: LiteracyLevel
    final_swahili_level: LiteracyLevel
    final_numeracy_level: NumeracyLevel
    teacher_note: Optional[str] = Field(default=None, max_length=2000)


class GroupingSave(BaseModel):
    subject: Subject
    groups: List[ClassGroup]
    teacher_summary: str = ""


class LevelCount(BaseModel):
    level: str
    count: int


class ClassDistribution(BaseModel):
    class_id: str
    student_count: int
    english: List[LevelCount]
    swahili: List[LevelCount]
    numeracy: List[LevelCount]


class LessonPlanRequest(BaseModel):
    subject: Subject
    target_level: str
    group_name: str = ""


# ---------------------------------------------------------------------------
# classes
# ---------------------------------------------------------------------------


@router.get("/classes", response_model=List[Classroom])
async def list_my_classes(user: Dict[str, Any] = Depends(require_teacher)):
    return get_db().list_classrooms_for_teacher(teacher_uid(user))


@router.post("/classes", response_model=Classroom, status_code=status.HTTP_201_CREATED)
async def create_class(
    body: ClassroomCreate, user: Dict[str, Any] = Depends(require_teacher)
):
    classroom = Classroom(
        id=new_id("cls"),
        name=body.name,
        school=body.school,
        grade=body.grade,
        teacher_uids=[teacher_uid(user)],
    )
    return get_db().save_classroom(classroom)


@router.get("/classes/{class_id}", response_model=Classroom)
async def get_class(class_id: str, user: Dict[str, Any] = Depends(require_teacher)):
    return assert_teacher_owns_class(user, class_id)


# ---------------------------------------------------------------------------
# students
# ---------------------------------------------------------------------------


@router.get("/classes/{class_id}/students", response_model=List[Student])
async def list_students(class_id: str, user: Dict[str, Any] = Depends(require_teacher)):
    assert_teacher_owns_class(user, class_id)
    return get_db().list_students_in_class(class_id)


@router.post(
    "/classes/{class_id}/students",
    response_model=Student,
    status_code=status.HTTP_201_CREATED,
)
async def add_student(
    class_id: str,
    body: StudentCreate,
    user: Dict[str, Any] = Depends(require_teacher),
):
    assert_teacher_owns_class(user, class_id)
    student = Student(
        id=new_id("stu"),
        class_id=class_id,
        **body.model_dump(),
    )
    return get_db().save_student(student)


@router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str, user: Dict[str, Any] = Depends(require_teacher)):
    return assert_teacher_owns_student(user, student_id)


@router.get("/students/{student_id}/assessments", response_model=List[AssessmentRecord])
async def list_student_assessments(
    student_id: str, user: Dict[str, Any] = Depends(require_teacher)
):
    assert_teacher_owns_student(user, student_id)
    return get_db().list_assessments_for_student(student_id)


# ---------------------------------------------------------------------------
# assessment: recommend (read-only) then decide (writes)
# ---------------------------------------------------------------------------


@router.post(
    "/students/{student_id}/assessments/recommend",
    response_model=AssessmentRecommendation,
)
async def recommend_levels(
    student_id: str,
    raw: AssessmentInput,
    user: Dict[str, Any] = Depends(require_teacher),
):
    """Deterministic evaluation only. Persists nothing — the teacher reviews
    this and then POSTs a decision."""
    student = assert_teacher_owns_student(user, student_id)
    result = evaluate_student_tarl_levels(raw)

    return AssessmentRecommendation(
        student_id=student.id,
        recommended_english_level=result.english_literacy_level,
        recommended_swahili_level=result.swahili_literacy_level,
        recommended_numeracy_level=result.numeracy_level,
        english_summary=result.english_summary,
        swahili_summary=result.swahili_summary,
        numeracy_summary=result.numeracy_summary,
        teacher_action_item=(
            f"Target English at '{result.english_literacy_level.value}', "
            f"Swahili at '{result.swahili_literacy_level.value}', "
            f"Numeracy at '{result.numeracy_level.value}'."
        ),
    )


@router.post(
    "/students/{student_id}/assessments",
    response_model=AssessmentRecord,
    status_code=status.HTTP_201_CREATED,
)
async def record_assessment(
    student_id: str,
    body: AssessmentDecision,
    user: Dict[str, Any] = Depends(require_teacher),
):
    """Persist the teacher's decision and move the student to those levels.

    The engine is re-run server-side so the stored `recommended_*` is what the
    rules actually produced for this raw observation — a client cannot fabricate
    a recommendation to make an override look like an agreement.
    """
    student = assert_teacher_owns_student(user, student_id)
    result = evaluate_student_tarl_levels(body.raw)

    overridden = (
        result.english_literacy_level != body.final_english_level
        or result.swahili_literacy_level != body.final_swahili_level
        or result.numeracy_level != body.final_numeracy_level
    )

    record = AssessmentRecord(
        assessment_id=new_id("asm"),
        student_id=student.id,
        class_id=student.class_id,
        assessed_by_uid=teacher_uid(user),
        assessed_at=utc_now(),
        recommended_english_level=result.english_literacy_level,
        recommended_swahili_level=result.swahili_literacy_level,
        recommended_numeracy_level=result.numeracy_level,
        final_english_level=body.final_english_level,
        final_swahili_level=body.final_swahili_level,
        final_numeracy_level=body.final_numeracy_level,
        source=AssessmentSource.TEACHER if overridden else AssessmentSource.LEVEL_ENGINE,
        teacher_note=body.teacher_note,
        raw_summary=result.numeracy_summary,
    )

    db = get_db()
    db.save_assessment(record)

    student.english_literacy_level = body.final_english_level
    student.swahili_literacy_level = body.final_swahili_level
    student.numeracy_level = body.final_numeracy_level
    student.last_assessed_at = record.assessed_at
    student.history = ([record.assessment_id] + student.history)[:50]
    db.save_student(student)

    return record


# ---------------------------------------------------------------------------
# classroom distribution
# ---------------------------------------------------------------------------


def _tally(values, order) -> List[LevelCount]:
    counts = {level.value: 0 for level in order}
    for value in values:
        counts[value.value] = counts.get(value.value, 0) + 1
    return [LevelCount(level=k, count=v) for k, v in counts.items()]


@router.get("/classes/{class_id}/distribution", response_model=ClassDistribution)
async def class_distribution(
    class_id: str, user: Dict[str, Any] = Depends(require_teacher)
):
    assert_teacher_owns_class(user, class_id)
    students = get_db().list_students_in_class(class_id)
    return ClassDistribution(
        class_id=class_id,
        student_count=len(students),
        english=_tally((s.english_literacy_level for s in students), LITERACY_ORDER),
        swahili=_tally((s.swahili_literacy_level for s in students), LITERACY_ORDER),
        numeracy=_tally((s.numeracy_level for s in students), NUMERACY_ORDER),
    )


# ---------------------------------------------------------------------------
# grouping: generate (read-only) then save (writes)
# ---------------------------------------------------------------------------


@router.post("/classes/{class_id}/grouping/generate", response_model=GroupingPlan)
async def generate_grouping(
    class_id: str,
    subject: Subject = Subject.NUMERACY,
    user: Dict[str, Any] = Depends(require_teacher),
):
    """Ask Gemini for a grouping recommendation. Nothing is persisted; the
    teacher edits it and saves via PUT."""
    assert_teacher_owns_class(user, class_id)
    students = get_db().list_students_in_class(class_id)

    if len(students) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Add at least two students before generating groups",
        )

    try:
        # The agent SDK call is synchronous; off-thread so it cannot block the
        # event loop for the length of a Gemini round trip.
        recommendation = await asyncio.to_thread(generate_classroom_groups, students)
    except Exception as exc:  # noqa: BLE001 - surfaced to the teacher as 503
        logger.exception("Grouping agent failed for class %s", class_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Grouping recommendation unavailable: {exc}",
        ) from exc

    return GroupingPlan(
        plan_id=new_id("grp"),
        class_id=class_id,
        subject=subject,
        groups=recommendation.groups,
        teacher_summary=recommendation.teacher_summary,
        generated_at=utc_now(),
        edited_by_teacher=False,
    )


@router.put("/classes/{class_id}/grouping", response_model=GroupingPlan)
async def save_grouping(
    class_id: str,
    body: GroupingSave,
    user: Dict[str, Any] = Depends(require_teacher),
):
    """Save the grouping the teacher settled on, edited or not."""
    assert_teacher_owns_class(user, class_id)
    known = {s.id for s in get_db().list_students_in_class(class_id)}
    placed = [sid for group in body.groups for sid in group.student_ids]

    unknown = sorted(set(placed) - known)
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Students not in this class: {', '.join(unknown)}",
        )
    if len(placed) != len(set(placed)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A student appears in more than one group",
        )

    plan = GroupingPlan(
        plan_id=new_id("grp"),
        class_id=class_id,
        subject=body.subject,
        groups=body.groups,
        teacher_summary=body.teacher_summary,
        generated_at=utc_now(),
        edited_by_teacher=True,
    )
    return get_db().save_grouping_plan(plan)


@router.get("/classes/{class_id}/grouping", response_model=Optional[GroupingPlan])
async def get_grouping(
    class_id: str,
    subject: Subject = Subject.NUMERACY,
    user: Dict[str, Any] = Depends(require_teacher),
):
    assert_teacher_owns_class(user, class_id)
    return get_db().get_latest_grouping_plan(class_id, subject)


# ---------------------------------------------------------------------------
# lesson plan
# ---------------------------------------------------------------------------


class LessonPlanResponse(BaseModel):
    """What the teacher sees.

    The split matters: `verified_level` and the curriculum fields are
    deterministic facts, `plan` is a Gemini recommendation. The UI must render
    them differently so a teacher never reads a suggestion as an assigned level.
    """

    subject: Subject
    group_name: str

    # deterministic
    verified_level: str
    curriculum_objectives: List[str]
    curriculum_skills: List[str]
    curriculum_activities: List[str]
    curriculum_assessment_criteria: str

    # AI recommendation — reviewed by the teacher, never persisted from here
    plan: LessonPlan
    generated_from_student_ids: List[str]
    evidence_count: int


@router.post("/classes/{class_id}/lesson-plan", response_model=LessonPlanResponse)
async def build_lesson_plan(
    class_id: str,
    body: LessonPlanRequest,
    user: Dict[str, Any] = Depends(require_teacher),
):
    """Build a lesson recommendation for one saved group.

        saved grouping -> student ids -> GroupContext -> curriculum
                       -> lesson agent -> LessonPlan

    The group's membership comes from the SAVED plan, not from the request, so
    a caller cannot ask for a lesson about students they do not teach. Nothing
    is persisted: the teacher reviews the recommendation and remains the
    decision-maker.
    """
    assert_teacher_owns_class(user, class_id)

    saved = get_db().get_latest_grouping_plan(class_id, body.subject)
    if saved is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Save a grouping for this subject before building plans",
        )

    group = next(
        (g for g in saved.groups if g.group_name == body.group_name),
        None,
    )
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No group named {body.group_name!r} in the saved grouping",
        )

    try:
        context = build_group_context(
            db=get_db(),
            class_id=class_id,
            group_name=group.group_name,
            subject=body.subject.value,
            student_ids=group.student_ids,
            target_level=body.target_level,
        )
        curriculum = curriculum_for(body.subject.value, body.target_level)
    except UnknownLevelError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc

    try:
        plan = await generate_lesson_plan(context)
    except Exception as exc:  # noqa: BLE001 — surfaced to the teacher as 503
        logger.exception("Lesson agent failed for class %s", class_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Lesson recommendation unavailable: {exc}",
        ) from exc

    return LessonPlanResponse(
        subject=body.subject,
        group_name=group.group_name,
        verified_level=body.target_level,
        curriculum_objectives=curriculum.objectives,
        curriculum_skills=curriculum.skills,
        curriculum_activities=curriculum.sample_activities,
        curriculum_assessment_criteria=curriculum.assessment_criteria,
        plan=plan,
        generated_from_student_ids=[s.student_id for s in context.students],
        evidence_count=len(context.recent_assessment_evidence),
    )
