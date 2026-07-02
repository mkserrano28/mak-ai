import json

from services.chat_service import (
    create_chat_completion,
    get_model_name
)

def generate_presentation_json(topic):

    prompt = f"""
Create a PowerPoint presentation about:

{topic}

Return ONLY valid JSON.

Example:

{{
  "title": "Artificial Intelligence",
  "slides": [
    {{
      "title": "Introduction",
      "content": [
        "Definition",
        "History",
        "Applications"
      ]
    }}
  ]
}}

Rules:
- Exactly 5 slides
- Each slide has 3-5 bullet points
- Return ONLY JSON
"""

    response = create_chat_completion(
        [
            {
                "role": "user",
                "content": prompt
            }
        ],
        get_model_name(False)
    )

    full_text = ""

    for chunk in response:

        if (
            hasattr(chunk.choices[0].delta, "content")
            and chunk.choices[0].delta.content
        ):
            full_text += chunk.choices[0].delta.content

    # Remove markdown if AI wraps the JSON
    full_text = full_text.replace("```json", "")
    full_text = full_text.replace("```", "")
    full_text = full_text.strip()

    print("=" * 80)
    print(full_text)
    print("=" * 80)
    
    try:
        return json.loads(full_text)
    except json.JSONDecodeError as e:
        print(full_text)
        raise Exception(f"Invalid JSON returned by AI:\n\n{e}")

def generate_presentation_from_text(text):

    prompt = f"""
You are an expert presentation creator.

Create a professional PowerPoint presentation from the document below.

Return ONLY valid JSON.

Format:

{{
    "title":"...",
    "slides":[
        {{
            "title":"...",
            "content":[
                "...",
                "...",
                "..."
            ]
        }}
    ]
}}

Rules:

- Create 8 slides
- Summarize the document
- 3-5 bullet points per slide
- No markdown
- No explanation
- Return ONLY JSON

Document:

{text}
"""

    response = create_chat_completion(
        [
            {
                "role": "user",
                "content": prompt
            }
        ],
        get_model_name(False)
    )

    full_text = ""

    for chunk in response:

        if (
            hasattr(chunk.choices[0].delta, "content")
            and chunk.choices[0].delta.content
        ):
            full_text += chunk.choices[0].delta.content

    full_text = full_text.replace("```json", "")
    full_text = full_text.replace("```", "")
    full_text = full_text.strip()

    return json.loads(full_text)


