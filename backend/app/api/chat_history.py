from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import (
    Chat,
    User,
    Workspace,
)


router = APIRouter()


class RenameChatRequest(BaseModel):
    title: str


class CreateChatRequest(BaseModel):
    workspace_id: int


def get_owned_chat(
    chat_id: int,
    user_id: int,
    db: Session,
):
    return (
        db.query(Chat)
        .join(
            Workspace,
            Chat.workspace_id == Workspace.id,
        )
        .filter(
            Chat.id == chat_id,
            Workspace.user_id == user_id,
        )
        .first()
    )


@router.get("/chats")
def get_chats(
    workspace_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Chat)
        .join(
            Workspace,
            Chat.workspace_id == Workspace.id,
        )
        .filter(
            Workspace.user_id == current_user.id
        )
    )

    if workspace_id is not None:
        query = query.filter(
            Chat.workspace_id == workspace_id
        )

    return (
        query
        .order_by(desc(Chat.updated_at))
        .all()
    )


@router.get("/chats/{chat_id}")
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .join(
            Workspace,
            Chat.workspace_id == Workspace.id,
        )
        .options(
            joinedload(Chat.messages)
        )
        .filter(
            Chat.id == chat_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return chat


@router.post("/chats")
def create_chat(
    request: CreateChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == request.workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    chat = Chat(
        title="New Chat",
        workspace_id=workspace.id,
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat


@router.patch("/chats/{chat_id}")
def rename_chat(
    chat_id: int,
    request: RenameChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = get_owned_chat(
        chat_id,
        current_user.id,
        db,
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    chat.title = request.title

    db.commit()
    db.refresh(chat)

    return chat


@router.delete("/chats/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = get_owned_chat(
        chat_id,
        current_user.id,
        db,
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted"
    }