import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from shared.models.models import Student, LiteracyLevel, NumeracyLevel

load_dotenv()

def get_client():
    key = os.getenv("GEMINI_API_KEY")
    if key:
        return genai.Client(api_key=key)
    return genai.Client(
        vertexai=True,
        project=os.getenv("GCP_PROJECT_ID", "vertical-theory-383513"),
        location=os.getenv("GCP_LOCATION", "us-central1"),
    )

class AssessmentResult(BaseModel):
    recommended_literacy_level: LiteracyLevel
    recommended_numeracy_level: NumeracyLevel
    feedback_swahili: str
    feedback_english: str

def assess_student_performance(student: Student, test_observation: str):
    client = get_client()

    prompt = f"""
Assess this TaRL student.

Student: {student.name}
Age: {student.age}
Current literacy: {student.literacy_level.value}
Current numeracy: {student.numeracy_level.value}

Observation:
{test_observation}

Return recommended literacy level, numeracy level,
and short feedback in English and Swahili.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AssessmentResult,
            temperature=0.2,
        ),
    )

    return AssessmentResult.model_validate_json(response.text)
