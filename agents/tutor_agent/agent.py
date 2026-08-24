import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from shared.models.models import Student, ExerciseResponse
from shared.memory import condense_student_history

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

def generate_targeted_exercise(student: Student, subject: str = "literacy"):
    client = get_client()

    if subject.lower() == "literacy":
        level = student.literacy_level.value
    else:
        subject = "numeracy"
        level = student.numeracy_level.value

    memory = condense_student_history(student.history, student.name)

    prompt = f"""
Create ONE {subject} exercise for a TaRL student.

Student: {student.name}
Age: {student.age}
Level: {level}

Focus: {memory.recommended_focus}

Use both English and Swahili.
Create multiple-choice options.
correct_answer must exactly equal one option.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExerciseResponse,
            temperature=0.3,
        ),
    )

    return ExerciseResponse.model_validate_json(response.text)
