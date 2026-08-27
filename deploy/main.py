import os
from typing import Any, Dict

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from deploy.teacher_api import router as teacher_router
from deploy.student_api import router as student_router
from shared.auth.dependencies import require_teacher
from shared.level_engine.evaluator import AssessmentInput, evaluate_student_tarl_levels

app = FastAPI(title="TaRL Learning Agents API", version="1.1.0")

# Browser frontends run on a different origin from Cloud Run. Origins are
# configured per environment rather than wildcarded, because these endpoints
# carry Firebase ID tokens.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8080,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(teacher_router)
app.include_router(student_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "tarl-agents-backend"}


@app.post("/assessment/evaluate", response_model=Dict[str, Any])
async def evaluate_assessment(
    assessment_data: AssessmentInput,
    current_user: Dict[str, Any] = Depends(require_teacher),
):
    """Stateless TaRL evaluation. Teacher or admin only.

    BREAKING CHANGE: `student_name` is no longer a query parameter. A level that
    is not attached to a student id cannot be persisted or overridden, so
    student-scoped assessment now lives at
    `POST /teacher/students/{student_id}/assessments` and its read-only
    counterpart `.../assessments/recommend`. This route remains for checking the
    rules against a raw observation without touching any record.
    """
    try:
        result = evaluate_student_tarl_levels(assessment_data)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process assessment: {exc}",
        ) from exc

    return result.model_dump()
