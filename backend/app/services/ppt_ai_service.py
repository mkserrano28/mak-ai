import json

from app.services.llm import generate_response


DEFAULT_SLIDE_COUNT = 10


def _clean_json_response(response: str) -> str:
    cleaned = response.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return cleaned.strip()


def _repair_slide_count(presentation: dict, target_content_slides: int) -> dict:
    """Keep the renderer deterministic if the model returns the wrong count."""
    slides = presentation.get("slides", [])

    if len(slides) > target_content_slides:
        presentation["slides"] = slides[:target_content_slides]
        return presentation

    if len(slides) < target_content_slides:
        # Add lightweight review slides rather than inventing research facts.
        existing = list(slides)
        while len(existing) < target_content_slides:
            if len(existing) == target_content_slides - 1:
                existing.append({
                    "type": "summary",
                    "title": "Summary",
                    "layout": "stats",
                    "image_index": None,
                    "content": [
                        "Review the main concepts covered in this presentation.",
                        "Connect the key ideas to the examples discussed.",
                        "Use the exercise to check your understanding.",
                    ],
                })
            else:
                existing.append({
                    "type": "review",
                    "title": "Key Review",
                    "layout": "cards",
                    "image_index": None,
                    "content": [
                        "Review the most important idea from the previous section.",
                        "Identify one example or application.",
                        "Explain why the concept matters.",
                    ],
                })
        presentation["slides"] = existing[:target_content_slides]

    return presentation


def _ensure_educational_sections(presentation: dict) -> dict:
    """Guarantee the teaching structure without changing slide count."""
    slides = presentation.get("slides", [])
    if len(slides) < 4:
        return presentation

    # Reserve fixed positions so every deck has a predictable teaching flow.
    # Slide 2 is objectives, the third-from-last is exercise, second-from-last
    # is summary, and the final content slide is conclusion.
    objectives = slides[0]
    objectives["type"] = "objectives"
    objectives["title"] = "Learning Objectives"
    objectives["layout"] = "image_text"
    if not objectives.get("content"):
        objectives["content"] = [
            "Explain the main ideas introduced in this lesson.",
            "Identify the most important concepts and terminology.",
            "Apply the concepts to examples or situations discussed.",
        ]

    exercise = slides[-3]
    exercise["type"] = "exercise"
    exercise["title"] = "Exercise"
    exercise["layout"] = "cards"
    exercise["image_index"] = None
    if not exercise.get("content"):
        exercise["content"] = [
            "Identify one key concept from the lesson.",
            "Explain the concept in your own words.",
            "Apply it to a real-world example or scenario.",
        ]

    summary = slides[-2]
    summary["type"] = "summary"
    summary["title"] = "Summary"
    summary["layout"] = "stats"
    summary["image_index"] = None
    if not summary.get("content"):
        summary["content"] = [
            "Review the main concepts covered.",
            "Connect the concepts to the examples and exercise.",
            "Remember the key takeaway from each section.",
        ]

    conclusion = slides[-1]
    conclusion["type"] = "conclusion"
    conclusion["title"] = "Conclusion"
    conclusion["layout"] = "conclusion"
    conclusion["image_index"] = None
    if not conclusion.get("content"):
        conclusion["content"] = [
            "The main concepts have been introduced and reviewed.",
            "Apply what you learned to relevant examples and situations.",
            "Use the exercise and summary to reinforce understanding.",
        ]

    return presentation


def generate_presentation_content(
    context: str,
    images: list[dict] | None = None,
    slide_count: int = DEFAULT_SLIDE_COUNT,
) -> dict:
    """
    Generate the educational content and visual structure for Mak-AI.

    slide_count is the TOTAL number of PowerPoint slides, including the
    title/hero slide that is created by powerpoint_service.py.
    """

    images = images or []

    # Keep requests reasonable while still allowing user-controlled decks.
    slide_count = max(5, min(int(slide_count), 40))
    content_slide_count = slide_count - 1

    image_context = "\n".join(
        [
            (
                f"IMAGE {index}\n"
                f"URL: {image.get('url', '')}\n"
                f"DESCRIPTION: {image.get('description', '')}"
            )
            for index, image in enumerate(images)
            if isinstance(image, dict)
        ]
    )

    prompt = f"""
You are the senior educational presentation designer for Mak-AI.

Create a polished PowerPoint presentation from the research context below.

USER REQUESTED TOTAL SLIDE COUNT: {slide_count}
CONTENT SLIDES TO RETURN IN JSON: {content_slide_count}

IMPORTANT SLIDE COUNT RULE:
- The PowerPoint renderer automatically creates slide 1 as the title/hero slide.
- Therefore you MUST return EXACTLY {content_slide_count} objects in the JSON "slides" array.
- The final PowerPoint MUST contain EXACTLY {slide_count} slides total.
- Never return {content_slide_count + 1} content slides.
- Never return fewer than {content_slide_count} content slides.

EDUCATIONAL STRUCTURE:
The deck must teach the topic, not simply summarize research.
Include these learning components naturally across the requested number of slides:

1. Objectives — near the beginning. Clearly state 3-4 things the learner should be able to understand or do.
2. Introduction — establish the topic and why it matters.
3. Main content — explain the major concepts in logical sections.
4. Examples / applications — use concrete examples when supported by research.
5. Exercise / activity — include at least one learner exercise, task, scenario, or discussion question.
6. Review — reinforce important concepts before the ending.
7. Summary — concise key takeaways.
8. Conclusion — MUST be the final content slide.

For longer presentations, expand the main content and examples rather than adding filler.
For shorter presentations, combine related concepts while keeping Objectives, Exercise, Summary,
and Conclusion.

DESIGN DIRECTION:
Use a premium modern agency/editorial presentation style:
- deep navy and clean off-white backgrounds
- electric blue and orange accents
- large bold headings
- clean grid alignment
- rounded cards
- circular photography
- numbered sections
- timelines where appropriate
- strong visual hierarchy
- intentional dark/light rhythm
- generous whitespace

Do NOT create a plain report with bullets on every slide.
Do NOT use the same layout for every slide.

Return ONLY valid JSON.

Required JSON format:

{{
    "title": "Presentation Title",
    "theme": {{
        "background": "#071321",
        "surface": "#10243A",
        "secondary_background": "#F5F8FC",
        "accent": "#0877E8",
        "secondary_accent": "#FF9F1C",
        "text": "#FFFFFF",
        "muted_text": "#94A3B8"
    }},
    "slides": [
        {{
            "type": "objectives",
            "title": "Learning Objectives",
            "layout": "cards",
            "image_index": null,
            "content": [
                "Learners will be able to ...",
                "Learners will be able to ...",
                "Learners will be able to ..."
            ]
        }}
    ]
}}

ALLOWED TYPES:
- objectives
- introduction
- content
- example
- exercise
- review
- summary
- conclusion

AVAILABLE LAYOUTS:
- image_text: important concept with one relevant image; use for Slide 2 or major concepts.
- cards: objectives, categories, applications, exercise questions, or grouped ideas.
- timeline: history, evolution, milestones, or process.
- dark_section: major transition or section divider.
- stats: highlights, review points, or summary.
- conclusion: final closing slide.

CONTENT RULES:
- Slide type "objectives" must appear near the beginning.
- Slide type "exercise" must appear before summary/conclusion.
- Slide type "summary" must appear near the end.
- Slide type "conclusion" MUST be the final JSON slide.
- Keep 2-4 concise content items per normal slide.
- Exercise slides may contain 3-5 questions/tasks.
- Avoid long paragraphs.
- Avoid repetition.
- Do not invent facts that are not supported by the research.
- Do not put URLs in slide content.
- Do not use markdown.
- Return ONLY valid JSON.

IMAGE RULES:
- Use only the provided IMAGE SOURCES.
- image_index must be a valid image index or null.
- Use images only where they genuinely improve understanding.
- Prefer unique images for different slides.
- Do not reuse the same image index across multiple slides.
- Do not use screenshots, infographics, diagrams, PowerPoint slides, logos, posters, memes,
  webpage captures, watermarked images, or images containing large amounts of embedded text.
- Prefer clean real-world photography, historical photographs, objects, people, places,
  technology hardware, architecture, and visually clear subject photography.
- Avoid images with visible Lorem ipsum, placeholder text, stock-template text, or large labels.

RESEARCH CONTEXT:

{context}

END RESEARCH CONTEXT.

IMAGE SOURCES:

{image_context}

END IMAGE SOURCES.
"""

    response = generate_response(
        [
            {
                "role": "system",
                "content": prompt,
            }
        ]
    )

    cleaned = _clean_json_response(response)

    try:
        presentation = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"AI returned invalid PowerPoint JSON: {exc}"
        )

    if "title" not in presentation:
        raise ValueError("PowerPoint response is missing 'title'.")

    if "slides" not in presentation:
        raise ValueError("PowerPoint response is missing 'slides'.")

    if not isinstance(presentation["slides"], list):
        raise ValueError("'slides' must be a list.")

    presentation.setdefault(
        "theme",
        {
            "background": "#071321",
            "surface": "#10243A",
            "secondary_background": "#F5F8FC",
            "accent": "#0877E8",
            "secondary_accent": "#FF9F1C",
            "text": "#FFFFFF",
            "muted_text": "#94A3B8",
        },
    )

    valid_layouts = {
        "hero",
        "image_text",
        "cards",
        "timeline",
        "dark_section",
        "stats",
        "conclusion",
    }

    valid_types = {
        "objectives",
        "introduction",
        "content",
        "example",
        "exercise",
        "review",
        "summary",
        "conclusion",
    }

    # Prevent image reuse even if the model selects the same index repeatedly.
    used_image_indexes = set()

    for slide in presentation["slides"]:
        if not isinstance(slide, dict):
            continue

        slide_type = slide.get("type", "content")
        if slide_type not in valid_types:
            slide_type = "content"
        slide["type"] = slide_type

        if slide.get("layout") not in valid_layouts:
            slide["layout"] = "image_text" if slide.get("image_index") is not None else "cards"

        if not isinstance(slide.get("content"), list):
            slide["content"] = []

        # Force appropriate layouts for the educational sections.
        if slide_type == "objectives":
            # Slide 2 is the 50/50 objectives + image slide when a suitable image exists.
            slide["layout"] = "image_text"
        elif slide_type == "exercise":
            slide["layout"] = "cards"
            slide["image_index"] = None
        elif slide_type == "summary":
            slide["layout"] = "stats"
            slide["image_index"] = None
        elif slide_type == "conclusion":
            slide["layout"] = "conclusion"
            slide["image_index"] = None

        image_index = slide.get("image_index")

        if not isinstance(image_index, int) or not (0 <= image_index < len(images)):
            image_index = None

        if image_index is not None and image_index in used_image_indexes:
            replacement = next(
                (i for i in range(len(images)) if i not in used_image_indexes),
                None,
            )
            image_index = replacement

        slide["image_index"] = image_index

        if image_index is not None:
            used_image_indexes.add(image_index)

    # Guarantee the requested total slide count.
    presentation = _repair_slide_count(
        presentation,
        content_slide_count,
    )

    presentation = _ensure_educational_sections(presentation)

    # Section insertion must never change the requested slide count.
    presentation = _repair_slide_count(
        presentation,
        content_slide_count,
    )

    # Guarantee conclusion is the final content slide.
    if presentation["slides"]:
        final_slide = presentation["slides"][-1]
        final_slide["type"] = "conclusion"
        final_slide["layout"] = "conclusion"
        final_slide["image_index"] = None
        if not final_slide.get("content"):
            final_slide["content"] = [
                "Review the central ideas from the presentation.",
                "Apply the concepts to the examples or exercise discussed.",
                "Use the key takeaways as a guide for further learning.",
            ]

    return presentation