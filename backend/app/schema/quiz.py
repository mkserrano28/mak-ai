from pydantic import BaseModel, Field
from typing import Dict, List


class QuizCheckResponse(BaseModel):
    score: int
    total: int
    percentage: float
    correct: int
    wrong: int
    answers: Dict[str, str]
    results: List[dict]


class QuizCheckRequest(BaseModel):
    answer_key: Dict[str, str] = Field(
        ...,
        description="Question number mapped to correct answer"
    )