import logging
import os

import firebase_admin
from firebase_admin import auth

logger = logging.getLogger(__name__)

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "tarl-agents")

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        options={
            "projectId": FIREBASE_PROJECT_ID,
        }
    )


def verify_id_token(token: str) -> dict:
    """Verify a Firebase ID token against the configured Firebase project."""
    try:
        return auth.verify_id_token(token)
    except Exception as exc:
        logger.error("Failed to verify Firebase ID token: %s", exc)
        raise ValueError("Invalid or expired authentication token.") from exc
