from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import (
    Chat,
    Message,
    User,
    Workspace,
)
from langchain_core.messages import HumanMessage
from app.graph.graph import graph

router = APIRouter()


class MessageCreate(BaseModel):
    chat_id: int
    role: str
    content: str


@router.post("/messages")
def create_message(
    request: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .join(
            Workspace,
            Chat.workspace_id == Workspace.id,
        )
        .filter(
            Chat.id == request.chat_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    message = Message(
        chat_id=chat.id,
        role=request.role,
        content=request.content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    # --------------------------------
    # Run Mak-AI LangGraph
    # --------------------------------

    state = {
        "messages": [
            HumanMessage(content=request.content)
        ],

        "user_id": str(current_user.id),

        "workspace_id": str(chat.workspace_id),

        "memory": {
            "summary": "",
            "preferences": {},
            "profile": {},
        },

        "context": {
            "rag": "",
            "documents": [],
            "sources": [],
            "research": {},
        },

        "metadata": {},

        "route": "",

        "prompt": [],

        "response": "",

        "workflow": None,

        "workflow_preview": None,

        "research": None,

        "sources": [],
    }

    print("================================")
    print("RUNNING MAK-AI LANGGRAPH")
    print("================================")

    result = graph.invoke(state)

    print("================================")
    print("LANGGRAPH COMPLETE")
    print("================================")
    print(result.get("route"))
    print(result.get("response"))

    return {
        "message": message,
        "type": result.get("route"),
        "response": result.get("response", ""),
        "powerpoint": result.get("context", {}).get("powerpoint"),
        "workflow": result.get("workflow"),
        "workflow_preview": result.get("workflow_preview"),
        "sources": result.get("sources", []),
    }