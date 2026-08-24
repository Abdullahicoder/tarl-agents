import os
from typing import List
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from shared.models.models import Student, ClassGroup

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

class GroupingRecommendation(BaseModel):
    groups: List[ClassGroup]
    teacher_summary: str

def generate_classroom_groups(students: List[Student]):
    client = get_client()

    data = [
        {
            "id": s.id,
            "name": s.name,
            "literacy": s.literacy_level.value,
            "numeracy": s.numeracy_level.value,
        }
        for s in students
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Group these TaRL students by instructional level:\n{data}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GroupingRecommendation,
            temperature=0.2,
        ),
    )

    return GroupingRecommendation.model_validate_json(response.text)
