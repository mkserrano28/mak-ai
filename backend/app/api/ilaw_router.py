from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.services.ilaw_docx import generate_ilaw_docx
from app.services.ilaw_generator import generate_ilaw

router = APIRouter(
    prefix="/api/ilaw",
    tags=["ILAW"]
)


@router.post("/export-docx")
def export_ilaw_docx(lesson_plan: dict):

    try:
        docx_file = generate_ilaw_docx(lesson_plan)

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

        print("ILAW DOCX export error:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/generate")
def generate_ilaw_plan(payload: dict):

    try:
        prompt = payload.get("prompt", "")

        if not prompt:
            raise HTTPException(
                status_code=400,
                detail="Prompt is required."
            )

        result = generate_ilaw(prompt)

        return result

    except Exception as e:

        print("ILAW generation error:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )