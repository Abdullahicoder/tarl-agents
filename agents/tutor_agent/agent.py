import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from shared.models.models import Student, ExerciseResponse

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


SYSTEM_PROMPT = """
You are a bilingual Swahili-English TaRL tutor for primary school
students in East Africa.

Rules:
- Write every question in English and Swahili.
- Write every answer option in English and Swahili.
- Write hints in English and Swahili.
- Keep the activity appropriate to the student's assessed level.
- Do not make the task harder than the student's level.
- Always make correct_answer exactly match one option.
- Keep instructions clear and encouraging.
"""


def generate_targeted_exercise(
    student: Student,
    subject: str = "literacy",
) -> ExerciseResponse:

    client = get_client()

    level = (
        student.literacy_level.value
        if subject.lower() == "literacy"
        else student.numeracy_level.value
    )

    prompt = f"""
Create one interactive {subject} exercise.

Student:
Name: {student.name}
Age: {student.age}
Assessed level: {level}

Return exactly one exercise.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=ExerciseResponse,
            temperature=0.3,
        ),
    )

    return ExerciseResponse.model_validate_json(response.text)
