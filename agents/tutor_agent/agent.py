import os
from google import genai
from google.genai import types
from shared.models.models import Student, ExerciseResponse, LiteracyLevel

client = genai.Client()

SYSTEM_PROMPT = """
You are a empathetic, highly encouraging TaRL (Teaching at the Right Level) tutor for young students in low-resource environments.
Key guidelines:
1. Target content STRICTLY at the student's current learning level.
2. Keep questions concise, accessible, and culturally neutral/engaging.
3. Use simple vocabulary and provide positive reinforcement.
"""

def generate_targeted_exercise(student: Student, subject: str = "literacy") -> ExerciseResponse:
    level = student.literacy_level.value if subject == "literacy" else student.numeracy_level.value
    
    prompt = f"""
    Generate a simple interactive multiple-choice practice exercise for a student at the '{level}' level in {subject}.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=ExerciseResponse,
            temperature=0.3,
            safety_settings=[
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                ),
                types.SafetySetting(
                    category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                ),
            ]
        )
    )
    return ExerciseResponse.model_validate_json(response.text)
