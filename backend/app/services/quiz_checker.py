# Mak-AI Quiz Checker
# Updated for two-stage quiz workflow:
# 1) Generate answer key from the question paper
# 2) Check a student's completed paper against that key
#
# No quiz results or answer keys are persisted to the database.
#
import base64
import json
from typing import Dict, Any

from app.services.llm import analyze_quiz_image


QUESTION_TYPES = {
    "multiple_choice",
    "true_false",
    "fill_blank",
    "short_answer",
    "math",
    "essay",
    "unknown",
}


def normalize_text(value: str) -> str:
    if not value:
        return ""

    return " ".join(value.strip().lower().split())


def calculate_score(questions: Dict[str, Any]):
    results = []

    earned_points = 0.0
    possible_points = 0.0

    for question_number, question in questions.items():

        question_type = question.get(
            "type",
            "unknown"
        )

        student_answer = question.get(
            "student_answer",
            ""
        )

        correct_answer = question.get(
            "correct_answer",
            ""
        )

        score = question.get(
            "score",
            0
        )

        max_score = question.get(
            "max_score",
            1
        )

        confidence = question.get(
            "confidence",
            "low"
        )

        status = question.get(
            "status",
            "needs_review"
        )

        try:
            score = float(score)
        except (TypeError, ValueError):
            score = 0

        try:
            max_score = float(max_score)
        except (TypeError, ValueError):
            max_score = 1

        earned_points += score
        possible_points += max_score

        results.append(
            {
                "question": question_number,
                "type": question_type,
                "question_text": question.get(
                    "question",
                    ""
                ),
                "student_answer": student_answer,
                "correct_answer": correct_answer,
                "score": score,
                "max_score": max_score,
                "status": status,
                "confidence": confidence,
                "feedback": question.get(
                    "feedback",
                    ""
                ),
            }
        )

    percentage = (
        round(
            (earned_points / possible_points) * 100,
            2,
        )
        if possible_points > 0
        else 0
    )

    return {
        "score": earned_points,
        "total": possible_points,
        "percentage": percentage,
        "correct": sum(
            1
            for item in results
            if item["status"] == "correct"
        ),
        "wrong": sum(
            1
            for item in results
            if item["status"] == "incorrect"
        ),
        "needs_review": sum(
            1
            for item in results
            if item["status"] == "needs_review"
        ),
        "results": results,
    }


async def analyze_student_quiz(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
):
    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    prompt = """
You are Mak-AI Quiz Checker.

Analyze the uploaded image of a student's completed quiz.

The teacher has NOT provided an answer key.

You must independently analyze the quiz.

For every question:

1. Read the question.
2. Identify the question type.
3. Read the student's answer.
4. Determine the objectively correct answer.
5. Compare the student's answer with the correct answer.
6. Assign a score.
7. Provide confidence.
8. Provide short feedback.

Supported question types:

- multiple_choice
- true_false
- fill_blank
- short_answer
- math
- essay
- unknown

Use this exact JSON structure:

{
    "questions": {
        "1": {
            "type": "multiple_choice",
            "question": "What is 2 + 2?",
            "student_answer": "B",
            "correct_answer": "B. 4",
            "score": 1,
            "max_score": 1,
            "status": "correct",
            "confidence": "high",
            "feedback": "The student's answer matches the correct answer."
        }
    }
}

GRADING RULES:

MULTIPLE CHOICE
- Identify the student's selected choice.
- Solve the question independently.
- Do not assume the student's selection is correct.

TRUE/FALSE
- Determine whether the statement is objectively true or false.
- Compare with the student's answer.

FILL IN THE BLANK
- Accept answers that are clearly equivalent in meaning.
- Ignore capitalization and unnecessary whitespace.

SHORT ANSWER
- Evaluate the meaning of the student's response.
- Do not require the exact same wording as the correct answer.
- Give full credit when the response correctly answers the question.

MATH
- Solve the problem independently.
- Check the student's numerical result.
- If the student's work is visible, consider meaningful partial credit when appropriate.
- Do not give credit for an incorrect final answer merely because some work is shown.

ESSAY
- Evaluate the answer based on correctness, relevance, completeness,
  and whether it addresses the question.
- Use reasonable partial credit.
- Do not require exact wording.
- If the question does not provide an explicit rubric, create a simple
  objective rubric appropriate to the question.

SCORING

For simple questions:

correct = full credit
incorrect = zero

For questions requiring explanation or multi-step reasoning:

Use partial credit when the student's work demonstrates meaningful
correct reasoning.

STATUS VALUES:

"correct"
"incorrect"
"needs_review"

Use "needs_review" when:

- the student's answer cannot be read reliably
- the question itself cannot be read reliably
- multiple answers appear selected
- the answer is ambiguous
- grading requires a subjective judgment that cannot be determined reliably

CONFIDENCE:

"high"
"medium"
"low"

IMPORTANT:

- Do not invent missing questions.
- Do not invent unreadable student answers.
- Do not assume an answer when the paper is unclear.
- Do not mark an answer correct merely because it looks plausible.
- Solve the question independently.
- Keep the question text faithful to the paper.
- Return JSON only.
- Do not include Markdown.
- Do not include explanations outside the JSON.
"""

    response = analyze_quiz_image(
        image_base64=image_base64,
        prompt=prompt,
        mime_type=mime_type,
    )

    try:
        data = json.loads(response)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Mak-AI returned invalid quiz JSON."
        ) from exc

    questions = data.get(
        "questions",
        {}
    )

    if not isinstance(
        questions,
        dict
    ):
        raise ValueError(
            "Invalid quiz analysis format."
        )

    return questions



def sanitize_answer_key(questions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prevent the vision model from inventing placeholder choices such as
    A/B/C/D = "missing" when the choices are not actually visible.
    Also normalizes True/False questions so the UI does not render MC choices.
    """
    cleaned = {}

    for number, question in questions.items():
        if not isinstance(question, dict):
            continue

        item = dict(question)
        question_type = item.get("type", "unknown")

        if question_type == "true_false":
            item["choices"] = {}

            answer = str(item.get("correct_answer", "")).strip().lower()
            if answer in {"true", "false"}:
                item["correct_answer"] = answer.capitalize()
                item["expected_answer"] = answer.capitalize()
            else:
                item["correct_answer"] = ""
                item["expected_answer"] = ""
                item["status"] = "needs_review"
                item["confidence"] = "low"

        elif question_type == "multiple_choice":
            raw_choices = item.get("choices", {})

            if not isinstance(raw_choices, dict):
                raw_choices = {}

            valid_choices = {}
            for letter, value in raw_choices.items():
                if value is None:
                    continue

                value_text = str(value).strip()
                if not value_text:
                    continue

                if value_text.lower() in {
                    "missing",
                    "unknown",
                    "not visible",
                    "unreadable",
                    "n/a",
                }:
                    continue

                valid_choices[str(letter).upper()] = value_text

            item["choices"] = valid_choices

            # If the model invented placeholder choices or the choices are
            # incomplete/missing, do not allow it to guess an answer.
            if len(valid_choices) == 0:
                item["correct_answer"] = ""
                item["expected_answer"] = ""
                item["status"] = "needs_review"
                item["confidence"] = "low"

            elif not item.get("correct_answer"):
                item["status"] = "needs_review"
                item["confidence"] = "low"

        cleaned[str(number)] = item

    return cleaned


async def generate_answer_key(image_bytes: bytes, mime_type: str = "image/jpeg"):
    """
    Read a quiz/question paper and generate an answer key.
    No student answers are expected in this stage.
    """

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
You are Mak-AI's Quiz Answer Key Generator.

Analyze the uploaded image of a quiz, assessment, worksheet,
or examination paper.

IMPORTANT:
This image contains the QUESTIONS, not the student's answers.

Your task is to generate the answer key automatically.

For EVERY visible question:

1. Read the complete question.
2. Identify the question type.
3. Read all visible choices if it is multiple choice.
4. Determine the objectively correct answer.
5. Provide the expected answer.
6. Assign an appropriate maximum score.
7. Explain briefly why the answer is correct.
8. Identify anything that requires teacher review.

Supported question types:

- multiple_choice
- true_false
- fill_blank
- short_answer
- math
- essay
- unknown

Return ONLY valid JSON using this exact structure:

{
    "questions": {
        "1": {
            "type": "multiple_choice",
            "question": "What is 2 + 2?",
            "choices": {
                "A": "3",
                "B": "4",
                "C": "5",
                "D": "6"
            },
            "correct_answer": "B",
            "expected_answer": "4",
            "max_score": 1,
            "status": "ready",
            "confidence": "high",
            "explanation": "2 + 2 equals 4."
        }
    }
}

RULES:

GENERAL:
- Read only questions that are actually visible.
- Do not invent missing questions.
- Do not invent missing choices.
- Preserve the wording of the question as closely as possible.
- Solve each question independently.
- Do not assume an answer simply because it appears frequently.
- Do not use a student's answer because no student answer is being provided.

SOURCE FIDELITY:

The uploaded image is the only source for the quiz content.

Do not fill missing portions using general knowledge.

If information is not visible in the image, mark the question
as needs_review instead of guessing.

MULTIPLE CHOICE:

Carefully inspect the image for every answer choice.

Only include choices that are physically visible in the
uploaded image.

For example, if the image contains:

A. Apple
B. Banana
C. Orange
D. Mango

return:

"choices": {
    "A": "Apple",
    "B": "Banana",
    "C": "Orange",
    "D": "Mango"
}

If the choices are missing or cut off, DO NOT create them
from your knowledge.

For example, if the image only contains:

"8. Choose the statement that is TRUE about asexual
reproduction in animals."

and the choices are outside the image, return:

"choices": {},
"correct_answer": "",
"expected_answer": "",
"status": "needs_review",
"confidence": "low"

Never return:

"A": "missing"
"B": "missing"
"C": "missing"
"D": "missing"

Never reconstruct missing choices from general knowledge.
TRUE/FALSE:
- Determine whether the statement is True or False.
- Set "type": "true_false".
- Set "choices": {}.
- correct_answer should be exactly "True" or "False".
- Do not create A/B/C/D choices for True/False questions.

FILL IN THE BLANK:
- Determine the expected answer.
- Include acceptable equivalent answers when appropriate.

SHORT ANSWER:
- Determine the expected concept or answer.
- The expected answer does not need to use exactly the same wording
  a student must use.

MATH:
- Solve the problem independently.
- Show the final expected answer.
- Use the appropriate mathematical precision.

ESSAY:
- Create an objective expected answer.
- Identify the main concepts that should appear in a correct response.
- Use:
  "status": "ready"
  when a reasonable grading basis can be established.
- For an essay, include a simple grading rubric in the explanation
  or an additional "rubric" field.

STATUS:

"ready"
The answer can be determined reliably.

"needs_review"
The question, choices, or required information is incomplete,
ambiguous, or unreadable.

CONFIDENCE:

"high"
"medium"
"low"

SCORING:

Use 1 point for ordinary questions unless the question clearly
requires more substantial reasoning.

For essays or multi-step questions, use a reasonable maximum score
such as 5 points.

IMPORTANT:
- Never invent information that is not visible or logically
  determinable from the question.
- If information needed to answer a question is missing,
  mark it as needs_review.
- Return JSON only.
- Do not return Markdown.
"""

    response = analyze_quiz_image(
        image_base64=image_base64,
        prompt=prompt,
        mime_type=mime_type,
    )

    try:
        data = json.loads(response)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Mak-AI returned invalid answer-key JSON."
        ) from exc

    questions = data.get("questions", {})

    if not isinstance(questions, dict):
        raise ValueError(
            "Invalid answer-key format returned by Mak-AI."
        )

    questions = sanitize_answer_key(questions)

    return questions


async def check_student_answers(
    image_bytes: bytes,
    answer_key: Dict[str, Any],
    mime_type: str = "image/jpeg",
):
    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    answer_key_text = json.dumps(
        answer_key,
        ensure_ascii=False,
    )

    prompt = f"""
You are Mak-AI's Student Quiz Grader.

The answer key has already been generated by Mak-AI.

Your task is ONLY to read the student's answers and compare
them against the provided answer key.

DO NOT create a new answer key.

ANSWER KEY:

{answer_key_text}

Now analyze the uploaded student's answer sheet.

For every question in the answer key:

1. Find the student's answer.
2. Compare it with the provided answer key.
3. Assign the appropriate score.
4. Set the status.
5. Set confidence.
6. Give brief feedback.

If an answer-key question already has "status": "needs_review"
because required information was missing from the quiz paper,
do not invent the missing answer. Keep that question as
"needs_review" unless the missing information is actually
available in the supplied materials.

For multiple-choice questions:
- Detect circles, checks, shading, handwritten letters,
  or other clear selection marks.
- Do not assume the student selected an answer.
- If the selection cannot be determined, use an empty answer
  and status "needs_review".

For short answers and fill-in-the-blank:
- Compare the student's meaning with the expected answer.

For math:
- Check the student's final answer.
- Give partial credit only when appropriate.

For essays:
- Evaluate against the expected answer/rubric from the answer key.
- Give reasonable partial credit.

Use:

"correct"
"incorrect"
"needs_review"

Confidence:

"high"
"medium"
"low"

Return ONLY JSON:

{{
    "questions": {{
        "1": {{
            "type": "multiple_choice",
            "question": "...",
            "student_answer": "A",
            "correct_answer": "A",
            "score": 1,
            "max_score": 1,
            "status": "correct",
            "confidence": "high",
            "feedback": "..."
        }}
    }}
}}

IMPORTANT:

- Do not invent student answers.
- Do not create new questions.
- Do not change the provided answer key.
- Do not assume an answer when the student's marking is unclear.
- Return JSON only.
"""

    response = analyze_quiz_image(
        image_base64=image_base64,
        prompt=prompt,
        mime_type=mime_type,
    )

    try:
        data = json.loads(response)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Mak-AI returned invalid grading JSON."
        ) from exc

    questions = data.get("questions", {})

    if not isinstance(questions, dict):
        raise ValueError(
            "Invalid grading format returned by Mak-AI."
        )

    return questions