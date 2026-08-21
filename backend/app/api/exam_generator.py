@router.post("/generate", response_model=ExamResponse)
async def generate_exam(request: ExamRequest):

    if not request.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter an exam prompt."
        )

    # Detect requested number of items from the teacher prompt.
    number_match = re.search(
        r"\b(\d+)\s*(?:items?|questions?)\b",
        request.prompt,
        flags=re.IGNORECASE,
    )

    if number_match:
        total_questions = int(number_match.group(1))
    else:
        total_questions = 20

    # Keep the generator within a reasonable range.
    total_questions = max(1, min(total_questions, 50))

    # Generate in smaller batches to avoid truncated JSON.
    BATCH_SIZE = 10

    all_questions = []
    exam_title = "Mak-AI Generated Exam"
    exam_instructions = "Choose the best answer."

    for batch_start in range(0, total_questions, BATCH_SIZE):

        batch_count = min(
            BATCH_SIZE,
            total_questions - batch_start
        )

        start_number = batch_start + 1
        end_number = batch_start + batch_count

        prompt = f"""
You are Mak-AI, an educational exam generator.

Create questions {start_number} through {end_number}
of an exam based on this teacher request:

{request.prompt}

The complete exam requires {total_questions} questions.

For THIS REQUEST, generate exactly {batch_count} questions.

Question numbers MUST start at {start_number}
and end at {end_number}.

Requirements:

1. Follow the requested grade level and subject.
2. Follow the requested number of items.
3. Make the questions appropriate for the requested grade.
4. Avoid duplicate questions.
5. Make questions clear and classroom-ready.
6. Use multiple-choice questions unless the teacher
   specifically requests another format.
7. Each multiple-choice question must have exactly
   four choices: A, B, C, D.
8. Include the correct answer.
9. Include a short explanation for every answer.
10. Do not repeat questions from previous batches.
11. Make the questions progressively varied.
12. The answer MUST be one of A, B, C, or D.

Return ONLY valid JSON.

Use this exact structure:

{{
  "questions": [
    {{
      "number": {start_number},
      "question": "Question text",
      "choices": {{
        "A": "Choice A",
        "B": "Choice B",
        "C": "Choice C",
        "D": "Choice D"
      }},
      "answer": "A",
      "explanation": "Short explanation"
    }}
  ]
}}

Do not return markdown.
Do not return ```json.
Do not add text outside the JSON.
"""

        try:

            result = generate_response(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are a reliable educational exam "
                            "generator. Return strict JSON only."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ]
            )

            if not isinstance(result, str):
                result = str(result)

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

            questions = data.get("questions", [])

            if len(questions) != batch_count:
                raise ValueError(
                    f"Expected {batch_count} questions "
                    f"but received {len(questions)}."
                )

            # Normalize question numbers.
            for index, question in enumerate(questions):
                question["number"] = start_number + index

            all_questions.extend(questions)

        except json.JSONDecodeError as error:

            print(
                f"Exam JSON error in batch "
                f"{start_number}-{end_number}:",
                error,
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Mak-AI returned invalid JSON "
                    f"for questions {start_number}-{end_number}."
                )
            )

        except Exception as error:

            print(
                f"Exam generation error in batch "
                f"{start_number}-{end_number}:",
                error,
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Unable to generate questions "
                    f"{start_number}-{end_number}."
                )
            )

    if len(all_questions) != total_questions:
        raise HTTPException(
            status_code=500,
            detail="Mak-AI did not generate the requested number of questions."
        )

    # Generate title/instructions locally instead of
    # asking the LLM to repeat them in every batch.
    title_match = re.search(
        r"(?:about|on|for)\s+(.+?)(?:\s+with|\s+\d+\s*(?:items?|questions?)|$)",
        request.prompt,
        flags=re.IGNORECASE,
    )

    if title_match:
        topic = title_match.group(1).strip()
        exam_title = f"{topic.title()} Exam"

    return {
        "title": exam_title,
        "instructions": (
            "Read each question carefully and choose "
            "the best answer. Mark only one answer "
            "per question."
        ),
        "questions": all_questions,
        "answer_key": [
            {
                "number": question.get(
                    "number",
                    index + 1,
                ),
                "answer": question.get(
                    "answer",
                    "",
                ),
                "explanation": question.get(
                    "explanation",
                    "",
                ),
            }
            for index, question in enumerate(all_questions)
        ],
    }