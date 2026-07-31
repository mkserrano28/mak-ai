from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.workflow_schema import GeneratedWorkflow
from app.services.workflow_generator import generate_ai_workflow


router = APIRouter()


class WorkflowGenerateRequest(BaseModel):
    prompt: str


@router.post(
    "/generate-workflow",
    response_model=GeneratedWorkflow,
)
async def generate_workflow(
    request: WorkflowGenerateRequest,
):
    try:
        workflow = await generate_ai_workflow(
            request.prompt
        )

        return workflow

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print("Workflow generation error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate workflow.",
        )