import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

from shared.models.models import Student, LiteracyLevel, NumeracyLevel

load_dotenv()


def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    project_id = os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
    location = os.getenv("GCP_LOCATION", "us-central1")

    if api_key:
        return genai.Client(api_key=api_key)

    return genai.Client(
        vertexai=True,
        project=project_id,
        location=location,
    )


class AssessmentResult(BaseModel):
    recommended_literacy_level: LiteracyLevel
    recommended_numeracy_level: NumeracyLevel
    feedback_swahili: str
    feedback_english: str


def assess_student_performance(
    student: Student,
    test_observation: str,
) -> AssessmentResult:
    client = get_client()

    prompt = f"""
Analyze this TaRL student assessment.

Student: {student.name}
Age: {student.age}

Current Literacy Level:
{student.literacy_level.value}

Current Numeracy Level:
{student.numeracy_level.value}

Teacher observation:
{test_observation}

Return:
1. Recommended literacy level
2. Recommended numeracy level
3. Short encouraging feedback in Swahili
4. Short encouraging feedback in English

Only recommend one of the allowed enum levels.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are a TaRL assessment specialist for primary school "
                "students in East Africa."
            ),
            response_mime_type="application/json",
            response_schema=AssessmentResult,
            temperature=0.2,
        ),
    )

    return AssessmentResult.model_validate_json(response.text)
