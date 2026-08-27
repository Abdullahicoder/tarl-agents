"""Short-lived student session tokens.

These sessions are for the young-learner picture-selection flow. They are
not Firebase identity and do not replace teacher authentication.
"""

import hashlib
import hmac
import os
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from json import dumps, loads


SESSION_TTL_SECONDS = 60 * 60 * 8


def _secret() -> bytes:
    secret = os.getenv("STUDENT_SESSION_SECRET")
    if not secret:
        raise RuntimeError(
            "STUDENT_SESSION_SECRET is required for student sessions"
        )
    return secret.encode()


def create_student_session(student_id: str, class_id: str) -> str:
    payload = {
        "student_id": student_id,
        "class_id": class_id,
        "expires_at": int(time.time()) + SESSION_TTL_SECONDS,
    }

    encoded = urlsafe_b64encode(
        dumps(payload, separators=(",", ":")).encode()
    ).rstrip(b"=")

    signature = hmac.new(
        _secret(),
        encoded,
        hashlib.sha256,
    ).digest()

    encoded_signature = urlsafe_b64encode(signature).rstrip(b"=")

    return (
        encoded.decode()
        + "."
        + encoded_signature.decode()
    )


def verify_student_session(token: str) -> dict:
    try:
        encoded_text, signature_text = token.split(".", 1)

        encoded = encoded_text.encode()
        supplied_signature = urlsafe_b64decode(
            signature_text + "=" * (-len(signature_text) % 4)
        )

        expected_signature = hmac.new(
            _secret(),
            encoded,
            hashlib.sha256,
        ).digest()

        if not hmac.compare_digest(
            supplied_signature,
            expected_signature,
        ):
            raise ValueError("Invalid student session")

        payload = loads(
            urlsafe_b64decode(
                encoded + b"=" * (-len(encoded) % 4)
            )
        )

        if int(payload["expires_at"]) < int(time.time()):
            raise ValueError("Student session expired")

        return payload

    except (ValueError, KeyError, TypeError) as exc:
        raise ValueError("Invalid student session") from exc
