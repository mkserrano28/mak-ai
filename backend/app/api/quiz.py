from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.services.quiz_checker import (
    calculate_score,
    check_student_answers,
    generate_answer_key,
)

router = APIRouter(
    prefix="/api/quiz",
    tags=["Quiz Checker"],
)

ALLOWED_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post("/generate-answer-key")
async def create_answer_key(
    image: UploadFile = File(...),
):
    try:
        if not image.content_type:
            raise ValueError("Unable to determine image type.")

        if image.content_type not in ALLOWED_TYPES:
            raise ValueError(
                "Please upload a JPG, PNG, or WEBP image."
            )

        image_bytes = await image.read()

        if not image_bytes:
            raise ValueError("Uploaded image is empty.")

        if len(image_bytes) > 20 * 1024 * 1024:
            raise ValueError(
                "Image is too large. Maximum size is 20 MB."
            )

        questions = await generate_answer_key(
            image_bytes=image_bytes,
            mime_type=image.content_type,
        )

        if not questions:
            raise ValueError(
                "Mak-AI could not detect any questions."
            )

        return {
            "total_questions": len(questions),
            "questions": questions,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        import traceback

        print("=" * 80)
        print("ANSWER KEY GENERATION ERROR")
        print(str(exc))
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=f"Answer key generation failed: {str(exc)}",
        )


@router.post("/check")
async def check_quiz(
    answer_key: str = Form(...),
    image: UploadFile = File(...),
):
    try:
        import json

        if not image.content_type:
            raise ValueError("Unable to determine image type.")

        if image.content_type not in ALLOWED_TYPES:
            raise ValueError(
                "Please upload a JPG, PNG, or WEBP image."
            )

        try:
            parsed_answer_key = json.loads(answer_key)
        except json.JSONDecodeError:
            raise ValueError("Invalid generated answer key.")

        if not isinstance(parsed_answer_key, dict):
            raise ValueError("Answer key must be an object.")

        image_bytes = await image.read()

        if not image_bytes:
            raise ValueError("Uploaded image is empty.")

        if len(image_bytes) > 20 * 1024 * 1024:
            raise ValueError(
                "Image is too large. Maximum size is 20 MB."
            )

        questions = await check_student_answers(
            image_bytes=image_bytes,
            answer_key=parsed_answer_key,
            mime_type=image.content_type,
        )

        if not questions:
            raise ValueError(
                "Mak-AI could not detect student answers."
            )

        return calculate_score(questions)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        import traceback

        print("=" * 80)
        print("QUIZ CHECKER ERROR")
        print(str(exc))
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=f"Quiz checking failed: {str(exc)}",
        )
