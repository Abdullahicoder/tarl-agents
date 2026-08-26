from fastapi import FastAPI, Depends, HTTPException, status
from typing import Dict, Any
from shared.auth.dependencies import require_teacher, require_authenticated_user
from shared.level_engine.evaluator import AssessmentInput
from agents.assessment_agent.evaluator import process_tarl_assessment

app = FastAPI(title="TaRL Learning Agents API", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "tarl-agents-backend"}

@app.post("/assessment/evaluate", response_model=Dict[str, Any])
async def evaluate_assessment(
    student_name: str,
    assessment_data: AssessmentInput,
    current_user: Dict[str, Any] = Depends(require_teacher)
):
    """
    Requires Teacher or Admin authentication.
    Evaluates student performance deterministically using TaRL criteria.
    """
    try:
        result = await process_tarl_assessment(
            student_name=student_name,
            raw_observation=assessment_data,
            generate_llm_feedback=True
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process assessment: {str(e)}"
        )
