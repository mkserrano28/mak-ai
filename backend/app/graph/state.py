from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

    user_id: str
    workspace_id: str

    memory: dict
    context: dict
    metadata: dict

    route: str

    prompt: list

    response: str

    workflow: dict | None
    workflow_preview: dict | None

    research: list | None

    sources: list