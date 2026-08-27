"""Access-control tests.

Two boundaries, both enforced server-side:

  * a student session reads exactly one learner's record
  * a teacher reaches only classrooms that list their uid

These run without Firestore or Firebase: the repository is a fake, and the
"token" for teacher routes is the decoded-claims dict that
`shared.auth.dependencies` produces after verification.
"""

import os
import time

import pytest
from fastapi import HTTPException

os.environ.setdefault("STUDENT_SESSION_SECRET", "test-secret-not-for-production")

from shared.auth import student_session as ss  # noqa: E402
from shared.models.models import (  # noqa: E402
    Classroom,
    LiteracyLevel,
    NumeracyLevel,
    Student,
)


# ---------------------------------------------------------------------------
# student sessions
# ---------------------------------------------------------------------------


def test_a_session_decodes_to_the_student_it_was_minted_for():
    payload = ss.verify_student_session(ss.create_student_session("s1", "c1"))
    assert payload["student_id"] == "s1"
    assert payload["class_id"] == "c1"


def test_a_session_for_one_child_does_not_name_another():
    payload = ss.verify_student_session(ss.create_student_session("s1", "c1"))
    assert payload["student_id"] != "s3"


def test_editing_the_payload_invalidates_the_signature():
    """The obvious attack: swap the student id in the base64 half and keep the
    signature. Must not verify."""
    from base64 import urlsafe_b64encode
    from json import dumps

    token = ss.create_student_session("s1", "c1")
    _, signature = token.split(".", 1)

    forged_payload = urlsafe_b64encode(
        dumps(
            {
                "student_id": "s3",
                "class_id": "c1",
                "expires_at": int(time.time()) + 3600,
            },
            separators=(",", ":"),
        ).encode()
    ).rstrip(b"=").decode()

    with pytest.raises(ValueError):
        ss.verify_student_session(f"{forged_payload}.{signature}")


def test_a_token_signed_with_another_secret_is_rejected(monkeypatch):
    token = ss.create_student_session("s1", "c1")
    monkeypatch.setenv("STUDENT_SESSION_SECRET", "a-different-secret")
    with pytest.raises(ValueError):
        ss.verify_student_session(token)


def test_an_expired_session_is_rejected(monkeypatch):
    token = ss.create_student_session("s1", "c1")

    # `ss.time` is the time module itself, so the replacement must close over
    # the ORIGINAL function. Calling time.time() inside the lambda would call
    # the patched lambda and recurse.
    real_time = time.time
    monkeypatch.setattr(
        ss.time, "time", lambda: real_time() + ss.SESSION_TTL_SECONDS + 60
    )

    with pytest.raises(ValueError):
        ss.verify_student_session(token)


@pytest.mark.parametrize("token", ["", "garbage", "a.b.c", "no-dot", "."])
def test_malformed_tokens_are_rejected(token):
    with pytest.raises(ValueError):
        ss.verify_student_session(token)


def test_missing_secret_refuses_rather_than_using_a_default(monkeypatch):
    """An unset secret must never mean 'sign with something predictable'."""
    monkeypatch.delenv("STUDENT_SESSION_SECRET", raising=False)
    with pytest.raises(RuntimeError):
        ss.create_student_session("s1", "c1")


# ---------------------------------------------------------------------------
# class access code
# ---------------------------------------------------------------------------


def test_class_code_gate_refuses_when_unconfigured(monkeypatch):
    from deploy import student_api

    monkeypatch.delenv("STUDENT_CLASS_CODE", raising=False)
    with pytest.raises(HTTPException) as exc:
        student_api.require_class_code("anything")
    assert exc.value.status_code == 503


def test_class_code_gate_rejects_a_wrong_code(monkeypatch):
    from deploy import student_api

    monkeypatch.setenv("STUDENT_CLASS_CODE", "right-code")
    with pytest.raises(HTTPException) as exc:
        student_api.require_class_code("wrong-code")
    assert exc.value.status_code == 401


def test_class_code_gate_accepts_the_right_code(monkeypatch):
    from deploy import student_api

    monkeypatch.setenv("STUDENT_CLASS_CODE", "right-code")
    assert student_api.require_class_code("right-code") == "right-code"


# ---------------------------------------------------------------------------
# teacher ownership
# ---------------------------------------------------------------------------


OWNER = "y7OmRFzNgFe883Z8v2bBHmz7CUn1"
INTRUDER = "some-other-teacher-uid"


class FakeDB:
    def __init__(self):
        self.classrooms = {
            "c1": Classroom(id="c1", name="Grade 3", teacher_uids=[OWNER]),
            "c2": Classroom(id="c2", name="Grade 4", teacher_uids=[INTRUDER]),
        }
        self.students = {
            "s1": Student(
                id="s1", name="Amina", age=8, class_id="c1",
                english_literacy_level=LiteracyLevel.BEGINNER,
                swahili_literacy_level=LiteracyLevel.LETTER,
                numeracy_level=NumeracyLevel.ONE_DIGIT,
            ),
        }

    def get_classroom(self, class_id):
        return self.classrooms.get(class_id)

    def get_student(self, student_id):
        return self.students.get(student_id)


@pytest.fixture
def teacher_api(monkeypatch):
    from deploy import teacher_api as module

    monkeypatch.setattr(module, "get_db", lambda: FakeDB())
    return module


def _user(uid, role="teacher"):
    return {"uid": uid, "role": role}


def test_a_teacher_reaches_their_own_class(teacher_api):
    classroom = teacher_api.assert_teacher_owns_class(_user(OWNER), "c1")
    assert classroom.id == "c1"


def test_a_teacher_cannot_reach_another_teachers_class(teacher_api):
    with pytest.raises(HTTPException) as exc:
        teacher_api.assert_teacher_owns_class(_user(OWNER), "c2")
    assert exc.value.status_code == 404


def test_an_unowned_class_looks_the_same_as_a_missing_one(teacher_api):
    """404 not 403, deliberately: a 403 would confirm that c2 exists."""
    unowned = pytest.raises(HTTPException)
    missing = pytest.raises(HTTPException)

    with unowned as a:
        teacher_api.assert_teacher_owns_class(_user(OWNER), "c2")
    with missing as b:
        teacher_api.assert_teacher_owns_class(_user(OWNER), "c_does_not_exist")

    assert a.value.status_code == b.value.status_code == 404
    assert a.value.detail == b.value.detail


def test_an_admin_reaches_any_class(teacher_api):
    classroom = teacher_api.assert_teacher_owns_class(_user(INTRUDER, "admin"), "c1")
    assert classroom.id == "c1"


def test_a_token_without_a_uid_is_rejected(teacher_api):
    with pytest.raises(HTTPException) as exc:
        teacher_api.teacher_uid({"role": "teacher"})
    assert exc.value.status_code == 401


def test_student_access_is_gated_by_the_owning_class(teacher_api):
    assert teacher_api.assert_teacher_owns_student(_user(OWNER), "s1").id == "s1"

    with pytest.raises(HTTPException) as exc:
        teacher_api.assert_teacher_owns_student(_user(INTRUDER), "s1")
    assert exc.value.status_code == 404


def test_a_missing_student_is_a_404(teacher_api):
    with pytest.raises(HTTPException) as exc:
        teacher_api.assert_teacher_owns_student(_user(OWNER), "nobody")
    assert exc.value.status_code == 404
