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
    User,
    Workspace,
)
from app.services.conversation_service import (
    process_chat,
)
from pydantic import BaseModel, Field


router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str




class ChatRequest(BaseModel):
    chat_id: int
    messages: list[ChatMessage]
    document_ids: list[int] = Field(default_factory=list)


async def stream_response(text):
    for ch in text:
        yield ch


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat_record = (
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

    if not chat_record:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return await process_chat(
        request,
        db,
    )