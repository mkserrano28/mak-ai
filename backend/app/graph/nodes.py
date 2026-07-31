from .state import AgentState
from app.services.rag_services import build_context
from app.services.llm import generate_response
from langchain_core.messages import AIMessage
from app.tools.tavily import web_search
from app.services.memory_service import load_memory


def planner_node(state: AgentState):
    print(">>> Planner Node")
    latest_message = state["messages"][-1].content
    latest = latest_message.lower()

    if any(
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

    print(f"Planner selected: {state['route']}")

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

def planner_node(state: AgentState):
    print(">>> Planner Node")

    latest_message = state["messages"][-1].content
    latest = latest_message.lower()

    # Workflow detection
    if any(
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

    print(f"Planner selected: {state['route']}")

    return state