from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse


router = APIRouter()


GENERATED_DIR = Path("generated_files")


@router.get("/ppt/download/{filename}")
async def download_powerpoint(filename: str):

    file_path = GENERATED_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="PowerPoint file not found.",
        )

    return FileResponse(
        path=file_path,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "presentationml.presentation"
        ),
        filename=file_path.name,
    )