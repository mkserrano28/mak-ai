from typing import Any, Literal
from pydantic import BaseModel, Field


ConnectionType = Literal[
    "main",
    "ai_agent",
    "ai_tool",
    "ai_languageModel",
    "ai_memory",
]


class WorkflowPosition(BaseModel):
    x: float = 0
    y: float = 0


class WorkflowNode(BaseModel):
    id: str
    label: str
    type: str

    category: Literal[
        "trigger",
        "action",
        "agent",
        "tool",
        "model",
        "memory",
    ] = "action"

    position: WorkflowPosition

    parameters: dict[str, Any] = Field(default_factory=dict)


class WorkflowEdge(BaseModel):
    source: str
    target: str

    connectionType: ConnectionType = "main"

    sourceHandle: str | None = None
    targetHandle: str | None = None


class GeneratedWorkflow(BaseModel):
    name: str = "Untitled Workflow"
    description: str = ""

    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]