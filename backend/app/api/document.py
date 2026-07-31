from pathlib import Path
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import (
    Document,
    User,
    Workspace,
)
from app.services.subscription_service import require_under_limit


router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def get_owned_workspace(
    workspace_id: int,
    user_id: int,
    db: Session,
):
    return (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == user_id,
        )
        .first()
    )


@router.post("/documents")
async def upload_document(
    workspace_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = get_owned_workspace(
        workspace_id,
        current_user.id,
        db,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    document_count = (
        db.query(Document)
        .filter(
            Document.workspace_id == workspace.id
        )
        .count()
    )

    require_under_limit(
        current_user,
        "max_documents_per_workspace",
        document_count,
    )

    safe_filename = Path(
        file.filename or "upload"
    ).name


@router.get("/documents")
def get_documents(
    workspace_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = get_owned_workspace(
        workspace_id,
        current_user.id,
        db,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return (
        db.query(Document)
        .filter(
            Document.workspace_id == workspace.id
        )
        .order_by(
            desc(Document.created_at)
        )
        .all()
    )


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .join(
            Workspace,
            Document.workspace_id == Workspace.id,
        )
        .filter(
            Document.id == document_id,
            Workspace.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    file_path = Path(document.filepath)

    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted"
    }