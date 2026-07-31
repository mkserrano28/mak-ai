from pathlib import Path
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.database.models import (
    Document,
    User,
    Workspace,
)
from app.services.pdf import extract_pdf_pages
from app.services.chunker import chunk_text
from app.services.document_cache import document_cache
from app.services.vectorstore import add_document
from app.services.subscription_service import (
    require_under_limit,
)


router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_files(
    workspace_id: int = Form(...),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------
    # Verify workspace ownership
    # -----------------------------------

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

    # -----------------------------------
    # Check document limit
    # -----------------------------------

    existing_count = (
        db.query(Document)
        .filter(
            Document.workspace_id == workspace.id
        )
        .count()
    )

    # Important when multiple files are
    # uploaded in one request.
    for index in range(len(files)):
        require_under_limit(
            current_user,
            "max_documents_per_workspace",
            existing_count + index,
        )

    uploaded = []

    # -----------------------------------
    # Process files
    # -----------------------------------

    for file in files:
        safe_filename = Path(
            file.filename or "upload"
        ).name

        stored_filename = (
            f"{current_user.id}_"
            f"{workspace.id}_"
            f"{safe_filename}"
        )

        destination = (
            UPLOAD_DIR / stored_filename
        )

        # -----------------------------------
        # Save physical file
        # -----------------------------------

        with destination.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # -----------------------------------
        # File metadata
        # -----------------------------------

        file_size = destination.stat().st_size

        file_type = (
            file.content_type
            or "application/octet-stream"
        )

        # -----------------------------------
        # Create database document FIRST
        # -----------------------------------

        document = Document(
            workspace_id=workspace.id,
            filename=safe_filename,
            filepath=str(destination),
            filetype=file_type,
            filesize=file_size,
        )

        db.add(document)

        # Important:
        # generates document.id without
        # committing the whole transaction
        db.flush()

        # -----------------------------------
        # Extract + index document
        # -----------------------------------

        chunks = []
        all_text = ""

        if safe_filename.lower().endswith(".pdf"):
            pages = extract_pdf_pages(
                str(destination)
            )

            for page in pages:
                page_chunks = chunk_text(
                    page["text"]
                )

                add_document(
                    document_id=document.id,
                    filename=stored_filename,
                    page=page["page"],
                    chunks=page_chunks,
                )

                chunks.extend(page_chunks)

                all_text += (
                    page["text"] + "\n"
                )

        # -----------------------------------
        # Cache document
        # -----------------------------------

        cache_key = (
            f"{current_user.id}:"
            f"{workspace.id}:"
            f"{safe_filename}"
        )

        document_cache[cache_key] = {
            "document_id": document.id,
            "chunks": chunks,
            "text": all_text,
        }

        # -----------------------------------
        # Upload response
        # -----------------------------------

        uploaded.append(
            {
                "id": document.id,
                "filename": safe_filename,
                "filetype": file_type,
                "filesize": file_size,
                "chunks": len(chunks),
                "status": "ready",
            }
        )

    db.commit()

    return {
        "success": True,
        "files": uploaded,
    }