from .state import AgentState
from app.services.rag_services import build_context
from app.services.llm import generate_response
from langchain_core.messages import AIMessage
from app.tools.tavily import web_search
from app.services.memory_service import load_memory

from app.services.ppt_ai_service import generate_presentation_content
from app.services.powerpoint_service import create_powerpoint
from pathlib import Path
import re


def planner_node(state: AgentState):
    print(">>> Planner Node")

    latest_message = state["messages"][-1].content
    latest = latest_message.lower()

    # PowerPoint MUST be checked first
    if any(
        word in latest
        for word in [
            "powerpoint",
            "power point",
            "ppt",
            "presentation",
            "slide deck",
            "slides",
        ]
    ):
        state["route"] = "powerpoint"

    elif any(
        word in latest
        for word in [
            "workflow",
            "automation",
            "automate",
            "n8n",
            "schedule",
            "cron",
            "trigger",
            "every",
            "hour",
            "daily",
            "weekly",
            "postgres",
            "mysql",
            "snowflake",
            "gmail",
            "outlook",
            "slack",
            "teams",
            "discord",
            "webhook",
            "sql",
            "query",
        ]
    ):
        state["route"] = "workflow"

    elif any(
        word in latest
        for word in [
            "latest",
            "news",
            "research",
            "search",
            "today",
            "current",
        ]
    ):
        state["route"] = "research"

    elif any(
        word in latest
        for word in [
            "pdf",
            "document",
            "file",
            "invoice",
            "report",
        ]
    ):
        state["route"] = "rag"

    else:
        state["route"] = "chat"

    # --------------------------------
    # PowerPoint slide-count detection
    # --------------------------------
    # The user controls the TOTAL number of slides, including the title slide.
    # Examples: "make 15 slides", "15-slide presentation", "20 pages".
    slide_match = re.search(
        r"\b(\d{1,2})\s*[- ]?\s*(?:slides?|pages?)\b",
        latest,
        re.IGNORECASE,
    )

    if slide_match:
        requested_slides = int(slide_match.group(1))
        # Keep requests within a practical range for Groq and PowerPoint.
        requested_slides = max(5, min(requested_slides, 40))
    else:
        requested_slides = 10

    state.setdefault("metadata", {})
    state["metadata"]["ppt_slide_count"] = requested_slides

    if state["route"] == "powerpoint":
        print(f">>> PowerPoint requested slides: {requested_slides}")

    print(f">>> Planner selected: {state['route']}")

    return state



def memory_node(state):
    print(">>> Memory Node")
    memory = load_memory(
        state["user_id"],
        state["workspace_id"]
    )

    state["memory"]["summary"] = memory["summary"]

    state["memory"]["preferences"] = memory["preferences"]

    state["memory"]["profile"] = memory["profile"]


    print("Memory Loaded")

    return state


def rag_node(state: AgentState):
    print(">>> RAG Node")
    question = state["messages"][-1].content

    context, sources, results = build_context(question)

    state["context"]["rag"] = context
    state["context"]["documents"] = results
    state["context"]["sources"] = sources

    print("Retrieved documents")
    print(state["context"]["rag"][:300])

    return state


def chat_node(state):
    print(">>> Chat Node")
    reply = generate_response(
        state["prompt"]
    )

    state["response"] = reply

    state["messages"].append(
        AIMessage(content=reply)
    )

    return state



def research_node(state):
    print(">>> Research Node")
    query = state["messages"][-1].content

    result = web_search(query)

    state["context"]["research"] = result

    print("Research Complete")

    return state

def powerpoint_node(state: AgentState):
    print(">>> PowerPoint Node")

    research = state["context"].get("research")

    if not research:
        raise ValueError(
            "No research results available for PowerPoint generation."
        )

    # Convert research result into text
    if isinstance(research, dict):
        research_context = str(research)
    else:
        research_context = str(research)

    # Generate structured presentation content
    images = []

    if isinstance(research, dict):
        images = research.get("images", []) or []

    print(f">>> Research images found: {len(images)}")

    slide_count = (
        state.get("metadata", {}).get("ppt_slide_count", 10)
    )

    print(f">>> PowerPoint total slide count: {slide_count}")

    presentation = generate_presentation_content(
        research_context,
        images=images,
        slide_count=slide_count,
    )

    # Generate actual .pptx
    pptx_file = create_powerpoint(
        title=presentation["title"],
        slides=presentation["slides"],
        theme=presentation.get("theme", {}),
        images=images,
    )


    # Store the generated file in state
    filename = Path(pptx_file).name

    state["context"]["powerpoint"] = {
        "title": presentation["title"],
        "filename": filename,
        "download_url": f"/api/ppt/download/{filename}",
        "file": pptx_file,
        "slides": presentation["slides"],
    }

    state["response"] = (
        "Your PowerPoint presentation is ready."
    )

    print("PowerPoint generated successfully.")

    return state