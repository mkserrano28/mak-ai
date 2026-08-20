from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schema.ilaw import (
    ILAWGenerateRequest,
    ILAWPlan,
)

from app.services.ilaw_generator import (
    generate_ilaw,
    modify_ilaw,
)

from app.services.ilaw_docx import generate_ilaw_docx


router = APIRouter(
    prefix="/api/ilaw",
    tags=["ILAW"],
)


# ============================================================
# GENERATE ILAW
# ============================================================

@router.post(
    "/generate",
    response_model=ILAWPlan,
)
def generate_ilaw_endpoint(
    request: ILAWGenerateRequest,
):

    result = generate_ilaw(
        prompt=request.prompt,
        grade_level=request.grade_level,
        sessions=request.sessions,
    )

    return ILAWPlan(**result)


# ============================================================
# MODIFY ILAW
# ============================================================

@router.post("/modify")
def modify_ilaw_plan(payload: dict):

    try:

        instruction = payload.get(
            "instruction"
        )

        lesson_plan = payload.get(
            "lesson_plan"
        )

        if not instruction:

            raise HTTPException(
                status_code=400,
                detail="Instruction is required.",
            )

        if not lesson_plan:

            raise HTTPException(
                status_code=400,
                detail="Lesson plan is required.",
            )

        updated_plan = modify_ilaw(
            lesson_plan=lesson_plan,
            instruction=instruction,
        )

        return {
            "success": True,
            "lesson_plan": updated_plan,
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "ILAW modification error:",
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# EXPORT ILAW DOCX
# ============================================================

@router.post("/export-docx")
def export_ilaw_docx(
    lesson_plan: dict,
):

    try:

        docx_file = generate_ilaw_docx(
            lesson_plan
        )

        return StreamingResponse(
            docx_file,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": (
                    'attachment; filename="ILAW_Lesson_Plan.docx"'
                )
            },
        )

    except Exception as e:

        print(
            "ILAW DOCX export error:",
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )