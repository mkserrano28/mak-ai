from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import User, Workspace
from app.services.subscription_service import require_under_limit


router = APIRouter()


class WorkspaceRequest(BaseModel):
    name: str


@router.get("/workspaces")
def get_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Workspace)
        .filter(
            Workspace.user_id == current_user.id
        )
        .order_by(Workspace.created_at)
        .all()
    )


@router.post("/workspaces")
def create_workspace(
    request: WorkspaceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_count = (
        db.query(Workspace)
        .filter(
            Workspace.user_id == current_user.id
        )
        .count()
    )

    require_under_limit(
        current_user,
        "max_workspaces",
        workspace_count,
    )

    workspace = Workspace(
        name=request.name,
        user_id=current_user.id,
    )

    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return workspace


@router.patch("/workspaces/{workspace_id}")
def rename_workspace(
    workspace_id: int,
    request: WorkspaceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    workspace.name = request.name

    db.commit()
    db.refresh(workspace)

    return workspace


@router.delete("/workspaces/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    db.delete(workspace)
    db.commit()

    return {
        "message": "Workspace deleted"
    }