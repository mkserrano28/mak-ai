from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import (
    User,
    Workflow,
)
from app.services.subscription_service import (
    require_under_limit,
)


router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"],
)


def get_owned_workflow(
    workflow_id: int,
    user_id: int,
    db: Session,
):
    return (
        db.query(Workflow)
        .filter(
            Workflow.id == workflow_id,
            Workflow.user_id == user_id,
        )
        .first()
    )


@router.post("/")
def save_workflow(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow_count = (
        db.query(Workflow)
        .filter(
            Workflow.user_id == current_user.id
        )
        .count()
    )

    require_under_limit(
        current_user,
        "max_workflows",
        workflow_count,
    )

    workflow = Workflow(
        name=payload.get(
            "name",
            "Untitled Workflow",
        ),
        workflow=payload,
        user_id=current_user.id,
    )

    db.add(workflow)
    db.commit()
    db.refresh(workflow)

    return {
        "message": "Workflow saved",
        "id": workflow.id,
    }

@router.get("/")
def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Workflow)
        .filter(
            Workflow.user_id == current_user.id
        )
        .all()
    )


@router.get("/{workflow_id}")
def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = get_owned_workflow(
        workflow_id,
        current_user.id,
        db,
    )

    if not workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found",
        )

    return workflow


@router.put("/{workflow_id}")
def update_workflow(
    workflow_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = get_owned_workflow(
        workflow_id,
        current_user.id,
        db,
    )

    if not workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found",
        )

    workflow.name = payload.get(
        "name",
        workflow.name,
    )

    workflow.workflow = payload

    db.commit()
    db.refresh(workflow)

    return {
        "message": "Workflow updated",
        "id": workflow.id,
    }


@router.delete("/{workflow_id}")
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = get_owned_workflow(
        workflow_id,
        current_user.id,
        db,
    )

    if not workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found",
        )

    db.delete(workflow)
    db.commit()

    return {
        "message": "Workflow deleted",
        "id": workflow_id,
    }