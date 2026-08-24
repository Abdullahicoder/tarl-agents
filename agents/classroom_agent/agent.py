import os
from typing import List
from google import genai
from google.genai import types
from shared.models.models import Student, ClassGroup
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    project_id = os.getenv("GCP_PROJECT_ID", "vertical-theory-383513")
    location = os.getenv("GCP_LOCATION", "us-central1")
    
    if api_key:
        return genai.Client(api_key=api_key)
    return genai.Client(vertexai=True, project=project_id, location=location)

class GroupingRecommendation(BaseModel):
    groups: List[ClassGroup]
    teacher_summary: str

def generate_classroom_groups(students: List[Student]) -> GroupingRecommendation:
    client = get_client()
    student_data = [
        {"id": s.id, "name": s.name, "literacy": s.literacy_level.value, "numeracy": s.numeracy_level.value}
        for s in students
    ]
    
    prompt = f"""
    Analyze the following classroom cohort data and group students according to TaRL principles:
    {student_data}
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are an expert TaRL Classroom Manager assisting primary school teachers with instructional grouping.",
            response_mime_type="application/json",
            response_schema=GroupingRecommendation,
            temperature=0.2
        )
    )
    return GroupingRecommendation.model_validate_json(response.text)
