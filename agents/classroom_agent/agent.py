from typing import List
from google import genai
from google.genai import types
from shared.models.models import Student, ClassGroup
from pydantic import BaseModel

client = genai.Client()

class GroupingRecommendation(BaseModel):
    groups: List[ClassGroup]
    teacher_summary: str

def generate_classroom_groups(students: List[Student]) -> GroupingRecommendation:
    student_data = [
        {"id": s.id, "name": s.name, "literacy": s.literacy_level.value, "numeracy": s.numeracy_level.value}
        for s in students
    ]
    
    prompt = f"""
    Analyze the following classroom cohort data and group students according to TaRL principles (grouping by skill level, not age/grade):
    {student_data}
    
    Create targeted skill-based learning groups for classroom instruction and provide specific hands-on activity recommendations for the teacher.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are a expert TaRL Classroom Manager assisting primary school teachers with instructional grouping.",
            response_mime_type="application/json",
            response_schema=GroupingRecommendation,
            temperature=0.2
        )
    )
    return GroupingRecommendation.model_validate_json(response.text)
