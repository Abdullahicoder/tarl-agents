"""Student-facing API.

This API deliberately exposes only the currently selected learner.
It does not expose the teacher roster or arbitrary student records.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, Field

from shared.auth.student_session import (
    create_student_session,
    verify_student_session,
)
from shared.data_access.firestore_client import FirestoreDB
from shared.models.models import Student


router = APIRouter(prefix="/student", tags=["student"])

db = FirestoreDB()


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
    last_assessed_at: str | None = None


def _get_student_from_session(
    authorization: str | None,
) -> Student:
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
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    student = db.get_student(session["student_id"])

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    if student.class_id != session["class_id"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student session",
        )

    return student


@router.post(
    "/session",
    response_model=StudentSessionResponse,
)
async def create_session(
    body: StudentSessionRequest,
):
    student = db.get_student(body.student_id)

    if student is None or student.class_id != body.class_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return StudentSessionResponse(
        session_token=create_student_session(
            student.id,
            student.class_id,
        ),
        expires_in=8 * 60 * 60,
    )


@router.get(
    "/me",
    response_model=StudentProfileResponse,
)
async def get_me(
    authorization: str | None = Header(default=None),
):
    student = _get_student_from_session(authorization)

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
