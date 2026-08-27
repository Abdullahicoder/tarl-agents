"""One place that decides how this project talks to Gemini.

Two projects are in play and they are not the same:

    FIREBASE_PROJECT_ID   tarl-agents             identity / auth
    GCP_PROJECT_ID        vertical-theory-383513  Firestore and Vertex AI

A bare ``genai.Client()`` picks up whatever ambient credentials it finds, which
in Cloud Shell means it can silently land on the wrong project. Every agent
should go through ``get_client()`` so the API-key and Vertex paths are chosen
the same way everywhere.
"""

import os

from google import genai

MODEL = "gemini-2.5-flash"


def get_client() -> genai.Client:
    """API key when one is set, otherwise Vertex AI with ADC."""
    key = os.getenv("GEMINI_API_KEY")
    if key:
        return genai.Client(api_key=key)

    return genai.Client(
        vertexai=True,
        project=os.getenv("GCP_PROJECT_ID", "vertical-theory-383513"),
        location=os.getenv("GCP_LOCATION", "us-central1"),
    )
