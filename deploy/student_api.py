"""Student-facing API.

Three routes, in the order a learner meets them:

    GET  /student/classes/{class_id}/roster   safe fields for one class
    POST /student/session                     picture tap -> short-lived token
    GET  /student/me                          that learner's own record

Security model. A six-year-old cannot hold a credential, so the device holds
one instead: the classroom tablet is provisioned with a class access code, and
both the roster and the session route require it. Without that gate, knowing
(or guessing) a student id is enough to open an eight-hour session for another
child — and the seeded ids are `s1`..`s6`.

The roster returns id, name and avatar. Never levels, never assessment history,
never another class.
"""

import hmac
import logging
import os
from functools import lru_cache
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from shared.auth.student_session import (
    create_student_session,
    verify_student_session,
)
from shared.data_access.firestore_client import FirestoreDB
from shared.models.models import Student

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/student", tags=["student"])


@lru_cache(maxsize=1)
def get_db() -> FirestoreDB:
    """Lazy, so importing this module does not require GCP credentials."""
    return FirestoreDB()


# ---------------------------------------------------------------------------
# class access code
# ---------------------------------------------------------------------------


def _expected_class_code() -> Optional[str]:
    return os.getenv("STUDENT_CLASS_CODE")


def require_class_code(x_class_code: str = Header(default="")) -> str:
    """Gate for every student route.

    Compared with `hmac.compare_digest` so a wrong code cannot be recovered by
    timing. If `STUDENT_CLASS_CODE` is unset the API refuses rather than
    defaulting to open — an unset secret must never mean "no check".
    """
    expected = _expected_class_code()
    if not expected:
        logger.error("STUDENT_CLASS_CODE is not set; refusing student requests")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Student access is not configured",
        )

    if not hmac.compare_digest(x_class_code, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This device is not set up for that class",
        )
    return x_class_code


# ---------------------------------------------------------------------------
# bodies
# ---------------------------------------------------------------------------


class RosterEntry(BaseModel):
    """Deliberately minimal — this is the only unauthenticated-ish surface."""

    id: str
    name: str
    avatar: str


class StudentSessionRequest(BaseModel):
    student_id: str = Field(min_length=1)
    class_id: str = Field(min_length=1)


class StudentSessionResponse(BaseModel):
    session_token: str
    expires_in: int


class StudentProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    class_id: str
    english_literacy_level: str
    swahili_literacy_level: str
    numeracy_level: str
    last_assessed_at: Optional[str] = None


# ---------------------------------------------------------------------------
# session helper
# ---------------------------------------------------------------------------


def _student_from_session(authorization: Optional[str]) -> Student:
    if not authorization or not authorization.startswith("StudentSession "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Student session required",
        )

    token = authorization.removeprefix("StudentSession ").strip()

    try:
        session = verify_student_session(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    student = get_db().get_student(session["student_id"])

    # The class is re-checked against the token rather than trusted from it:
    # a student moved to another class must not keep reading through an old
    # session.
    if student is None or student.class_id != session["class_id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student session",
        )

    return student


# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------


@router.get("/classes/{class_id}/roster", response_model=List[RosterEntry])
async def class_roster(class_id: str, _code: str = Depends(require_class_code)):
    """Faces to tap. Safe fields only."""
    students = get_db().list_students_in_class(class_id)
    return [
        RosterEntry(id=s.id, name=s.name, avatar=getattr(s, "avatar", "") or s.id)
        for s in students
    ]


@router.post("/session", response_model=StudentSessionResponse)
async def create_session(
    body: StudentSessionRequest,
    _code: str = Depends(require_class_code),
):
    student = get_db().get_student(body.student_id)

    if student is None or student.class_id != body.class_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    return StudentSessionResponse(
        session_token=create_student_session(student.id, student.class_id),
        expires_in=8 * 60 * 60,
    )


@router.get("/me", response_model=StudentProfileResponse)
async def get_me(authorization: Optional[str] = Header(default=None)):
    student = _student_from_session(authorization)

    return StudentProfileResponse(
        id=student.id,
        name=student.name,
        age=student.age,
        class_id=student.class_id,
        english_literacy_level=student.english_literacy_level.value,
        swahili_literacy_level=student.swahili_literacy_level.value,
        numeracy_level=student.numeracy_level.value,
        last_assessed_at=student.last_assessed_at,
    )
