from langgraph.graph import StateGraph, END
from .prompt_builder import prompt_builder_node

from .state import AgentState
from .nodes import (
    planner_node,
    memory_node,
    rag_node,
    research_node,
    chat_node,
)
from app.graph.workflow_nodes import workflow_planner_node

builder = StateGraph(AgentState)

builder.add_node("planner", planner_node)
builder.add_node("memory", memory_node)
builder.add_node("rag", rag_node)
builder.add_node("research", research_node)
builder.add_node("prompt", prompt_builder_node)
builder.add_node("chat", chat_node)
builder.add_node("workflow_planner", workflow_planner_node)

builder.set_entry_point("planner")

builder.add_conditional_edges(
    "planner",
    lambda state: state["route"],
    {
        "chat": "prompt",
        "rag": "memory",
        "research": "research",
        "workflow": "workflow_planner",
    },
)

builder.add_edge("memory", "rag")
builder.add_edge("rag", "prompt")
builder.add_edge("research", "prompt")
builder.add_edge("prompt", "chat")
builder.add_edge("chat", END)
builder.add_edge(
    "workflow_planner",
    END
)

graph = builder.compile()