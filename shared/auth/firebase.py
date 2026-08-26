import os
import logging
import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin SDK using Application Default Credentials (ADC)
if not firebase_admin._apps:
    options = {'projectId': os.getenv('GOOGLE_CLOUD_PROJECT', 'tarl-agents')}
    firebase_admin.initialize_app(options=options)

logger = logging.getLogger(__name__)

def verify_id_token(token: str) -> dict:
    """Verifies a Firebase ID token and returns the decoded token payload."""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Failed to verify Firebase ID token: {e}")
        raise ValueError("Invalid or expired authentication token.")
