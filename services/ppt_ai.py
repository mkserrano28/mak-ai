import json

from services.chat_service import (
    create_chat_completion,
    get_model_name
)


def _call_ai(prompt: str):
    """Call the LLM and return parsed JSON."""

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

    full_text = (
        full_text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    print("=" * 80)
    print(full_text)
    print("=" * 80)

    try:
        return json.loads(full_text)

    except json.JSONDecodeError as e:

        raise Exception(
            f"Invalid JSON returned by AI:\n\n{e}\n\n{full_text}"
        )


def generate_presentation_json(topic):

    prompt = f"""
You are an expert presentation designer.

Create a professional PowerPoint presentation about:

{topic}

Return ONLY valid JSON.

Format:

{{
    "title": "...",
    "slides": [
        {{
            "title": "...",
            "content": [
                "...",
                "...",
                "...",
                "..."
            ]
        }}
    ]
}}

Requirements:

- Decide the appropriate number of slides.
- Small topics: 8–10 slides.
- Medium topics: 12–16 slides.
- Large or technical topics: 18–25 slides.
- Each slide must contain 4–6 detailed bullet points.
- Each bullet should contain 12–20 words.
- Keep every bullet concise and presentation-friendly.
- Do not write long paragraphs.
- Focus on one key idea per bullet.
- Explain concepts clearly.
- Include practical examples whenever possible.
- Avoid repeating information.
- Organize the presentation logically.

The presentation should include:

1. Title
2. Introduction
3. Background
4. Main Concepts
5. Key Features
6. Benefits
7. Challenges
8. Real-world Applications
9. Future Trends
10. Summary

Return ONLY valid JSON.
"""

    return _call_ai(prompt)


def generate_presentation_from_text(text):

    prompt = f"""
You are an expert presentation designer.

Analyze the document below and create a professional PowerPoint presentation.

Return ONLY valid JSON.

Format:

{{
    "title": "...",
    "slides": [
        {{
            "title": "...",
            "content": [
                "...",
                "...",
                "...",
                "..."
            ]
        }}
    ]
}}

Requirements:

- Read the ENTIRE document.
- Decide the number of slides based on the document length.
- Generate between 10 and 30 slides.
- Cover every important section.
- Each slide must contain 4–6 detailed bullet points.
- Every bullet must be a complete sentence.
- Summarize long paragraphs into concise educational points.
- Preserve important facts and concepts.
- Avoid repeating information.
- Finish with a conclusion slide.

Document:

{text}

Return ONLY valid JSON.
"""

    return _call_ai(prompt)