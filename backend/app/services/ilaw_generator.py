import json

from app.services.llm import generate_response


def generate_ilaw(
    prompt: str,
    grade_level: str = "",
    sessions: int = 5,
) -> dict:

    system_prompt = """
You are IMAC-AI's ILAW lesson plan generator.

Your task is to create a complete ILAW lesson plan
based on the teacher's request.

Return ONLY valid JSON.

Do NOT use Markdown.
Do NOT wrap the JSON in ```json.
Do NOT add explanations before or after the JSON.

The JSON must follow this exact structure:

{
  "lesson_information": {
    "title": "",
    "learning_area": "",
    "teachers": [],
    "grade_level": "",
    "section": "",
    "sessions": 5
  },

  "references": [],

  "declaration_of_ai_use": "",

  "intentions": {
    "content_standard": "",
    "performance_standard": "",
    "learning_competencies": [],
    "specific_objectives": [],
    "learning_objectives": "",
    "learner_context": ""
  },

  "learning_experiences": {
    "learning_resources": "",
    "pre_lesson": "",
    "flow_daylong": {
      "activity": "",
      "discussion": "",
      "deduction": "",
      "concepts": []
    },
    "opportunities_for_integration": ""
  },

  "sessions": [
    {
      "session_number": 1,
      "topic": "",
      "activities": "",
      "assessment": ""
    }
  ],

  "assessment": {
    "formative_assessment": "",
    "guide_questions": []
  },

  "ways_forward": {
    "extended_learning": "",
    "reflections": "",
    "application": ""
  },

  "prepared_checked_noted": {
    "prepared_by": "",
    "checked_by": "",
    "noted_by": ""
  }
}

IMPORTANT REQUIREMENTS:

1. Create exactly the requested number of sessions.
2. session_number must start at 1.
3. Each session must contain a topic,
   activities, and assessment.
4. Keep the lesson appropriate for the requested
   grade level.
5. Use the teacher's prompt as the primary instruction.
6. Do not invent teacher names.
7. Leave teacher/signatory fields empty unless
   the teacher explicitly provides them.
8. Return valid JSON only.
"""

    user_prompt = f"""
Teacher request:

{prompt}

Requested grade level:
{grade_level}

Requested number of sessions:
{sessions}

Generate the complete ILAW lesson plan now.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt,
        },
    ]

    response = generate_response(messages)

    try:
        return json.loads(response)

    except json.JSONDecodeError as error:
        print("ILAW AI returned invalid JSON.")
        print("Raw response:")
        print(response)

        raise ValueError(
            "IMAC-AI returned invalid ILAW JSON."
        ) from error

def modify_ilaw(lesson_plan: dict, instruction: str):

    system_prompt = """
You are IMAC-AI, an expert lesson plan assistant.

You are modifying an existing ILAW lesson plan.

IMPORTANT RULES:

1. Preserve the existing ILAW structure.
2. Only modify what the teacher requested.
3. Do not remove unrelated information.
4. Keep all sessions unless the teacher explicitly asks to change them.
5. Return ONLY valid JSON.
6. Do not use Markdown.
7. Do not wrap the JSON in ```json.
8. The output must be the complete updated lesson plan.
"""

    user_prompt = f"""
CURRENT ILAW LESSON PLAN:

{json.dumps(lesson_plan, indent=2)}

TEACHER'S REQUEST:

{instruction}

Return the COMPLETE modified ILAW lesson plan as valid JSON.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt,
        },
    ]

    response = generate_response(messages)

    response = response.strip()

    # Remove accidental markdown fences
    if response.startswith("```json"):
        response = response[7:]

    if response.startswith("```"):
        response = response[3:]

    if response.endswith("```"):
        response = response[:-3]

    response = response.strip()

    try:
        updated_plan = json.loads(response)

    except json.JSONDecodeError as e:
        print("Invalid JSON returned by LLM:")
        print(response)

        raise ValueError(
            f"AI returned invalid lesson plan JSON: {e}"
        )

    return updated_plan