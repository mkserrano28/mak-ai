from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm import generate_response

import json
import re


router = APIRouter()


class BamboozleRequest(BaseModel):
    grade: str
    subject: str


class BamboozleQuestion(BaseModel):
    question: str
    answer: str
    explanation: str


class BamboozleResponse(BaseModel):
    questions: list[BamboozleQuestion]


@router.post("/generate", response_model=BamboozleResponse)
async def generate_bamboozle(request: BamboozleRequest):

    prompt = f"""
You are Mak-AI, an educational AI assistant.

Generate exactly 20 high-quality Bamboozle questions.

Target:
- Grade: {request.grade}
- Subject: {request.subject}

Requirements:

1. Questions must be appropriate for Grade {request.grade}.
2. Questions must match the selected subject.
3. Questions should range from easy to challenging.
4. Avoid ambiguous questions.
5. Each question must have one clearly correct answer.
6. Do not repeat questions.
7. Keep questions suitable for a classroom competition.
8. Answers should be concise.
9. Include a short explanation that a teacher can use after revealing the answer.
10. Do not include multiple-choice options.

Return ONLY valid JSON.

Use exactly this format:

{{
  "questions": [
    {{
      "question": "Question here",
      "answer": "Correct answer",
      "explanation": "Short explanation"
    }}
  ]
}}

Do not include markdown.
Do not include ```json.
Do not include any text before or after the JSON.
"""

    try:
        result = generate_response([
            {
                "role": "system",
                "content": (
                    "You generate accurate educational questions "
                    "and return strict JSON when requested."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ])

        if not isinstance(result, str):
            result = str(result)

        # Remove accidental markdown fences
        result = result.strip()

        result = re.sub(
            r"^```json\s*",
            "",
            result,
            flags=re.IGNORECASE,
        )

        result = re.sub(
            r"^```\s*",
            "",
            result,
        )

        result = re.sub(
            r"\s*```$",
            "",
            result,
        )

        data = json.loads(result)

        questions = data.get("questions")

        if not isinstance(questions, list):
            raise ValueError("Invalid questions format.")

        if len(questions) < 20:
            raise ValueError(
                f"Expected 20 questions, received {len(questions)}."
            )

        questions = questions[:20]

        validated_questions = []

        for item in questions:

            question = str(
                item.get("question", "")
            ).strip()

            answer = str(
                item.get("answer", "")
            ).strip()

            explanation = str(
                item.get("explanation", "")
            ).strip()

            if not question or not answer:
                continue

            validated_questions.append(
                BamboozleQuestion(
                    question=question,
                    answer=answer,
                    explanation=explanation,
                )
            )

        if len(validated_questions) < 20:
            raise ValueError(
                "AI returned incomplete questions."
            )

        return {
            "questions": validated_questions
        }

    except json.JSONDecodeError as error:

        print(
            "Bamboozle JSON parsing error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Mak-AI returned an invalid question format.",
        )

    except Exception as error:

        print(
            "Bamboozle generation error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate Bamboozle questions.",
        )