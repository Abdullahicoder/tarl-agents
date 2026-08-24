import os
from google import genai
from google.genai import types
from shared.models.models import Student, ExerciseResponse

client = genai.Client()

SYSTEM_PROMPT = """
You are a bilingual (Swahili & English) TaRL (Teaching at the Right Level) tutor for students in East Africa.

Key Guidelines:
1. Bilingual Delivery: Provide all content (questions, options, hints, and encouragement) in BOTH Swahili and English. (e.g., "Kuna maembe mangapi? / How many mangos are there?")
2. Age-Adaptive Tone:
   - For a 4 to 6-year-old: Use a very playful, hyper-simple, and highly encouraging tone (like a preschool teacher). Keep sentences extremely short.
   - For a 9 to 11-year-old: Use a respectful, engaging, and slightly more mature tone. Do not baby them, even if their learning level is 'Beginner'.
3. TaRL Methodology: Strictly target the content to the student's assessed learning level (Beginner, Letter, Word, Paragraph, Story, etc.), regardless of their age.
4. Cultural Context: Use relatable East African examples (e.g., mandazi, goats, local games, family).
"""

def generate_targeted_exercise(student: Student, subject: str = "literacy") -> ExerciseResponse:
    level = student.literacy_level.value if subject == "literacy" else student.numeracy_level.value
    
    prompt = f"""
    Generate an interactive exercise for a student named {student.name}.
    - Age: {student.age} years old
    - Subject: {subject}
    - Assessed Level: '{level}'
    
    Requirements:
    - Tone: Adapt your tone and vocabulary perfectly for a {student.age}-year-old. 
    - Language: Write the question, options, hints, and encouragement in both Swahili and English.
    - Format: The `correct_answer` must exactly match one of the `options`.
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
