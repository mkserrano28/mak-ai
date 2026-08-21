from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from fastapi.responses import Response

from app.services.file_converter import (
    MAX_FILE_SIZE,
    convert_file,
)

ALLOWED_FORMATS = {"pdf", "docx", "txt", "pptx"}

FORMAT_ALIASES = {
    "doc": "docx",
    "ppt": "pptx",
}

router = APIRouter(
    prefix="/api/file-converter",
    tags=["File Converter"],
)


@router.get("/formats")
async def formats(input_format: str):
    source = input_format.lower().lstrip(".")
    source = FORMAT_ALIASES.get(source, source)

    if source not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Only Word, PDF, TXT, and PowerPoint files are supported."
        )

    # The UI intentionally exposes only these four output formats.
    # The actual conversion is still validated by CloudConvert.
    return {
        "input_format": source,
        "formats": [
            {"format": "pdf", "label": "PDF"},
            {"format": "docx", "label": "Word"},
            {"format": "txt", "label": "Text"},
            {"format": "pptx", "label": "PowerPoint"},
        ],
    }

@router.post("/convert")
async def convert(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    try:
        if not file.filename:
            raise ValueError("Please select a file.")

        file_bytes = await file.read()

        if not file_bytes:
            raise ValueError("The uploaded file is empty.")

        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError(
                "File is too large. Maximum size is 25 MB."
            )

        target_format = (
            target_format
            .lower()
            .strip()
            .lstrip(".")
        )

        target_format = FORMAT_ALIASES.get(
            target_format,
            target_format,
        )

        if target_format not in ALLOWED_FORMATS:
            raise ValueError(
                "Mak-AI only supports conversion between "
                "Word, PDF, TXT, and PowerPoint."
            )

        converted_bytes, output_filename = convert_file(
            file_bytes=file_bytes,
            filename=file.filename,
            target_format=target_format,
        )

        extension = Path(
            output_filename
        ).suffix.lower()

        media_types = {
            ".pdf": "application/pdf",
            ".txt": "text/plain; charset=utf-8",
            ".docx": (
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            ".pptx": (
                "application/vnd.openxmlformats-officedocument."
                "presentationml.presentation"
            ),
        }

        return Response(
            content=converted_bytes,
            media_type=media_types.get(
                extension,
                "application/octet-stream",
            ),
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{output_filename}"'
                )
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except RuntimeError as exc:
        print("=" * 80)
        print("FILE CONVERTER ERROR")
        print(str(exc))
        print("=" * 80)

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )

    except Exception as exc:
        print("=" * 80)
        print("FILE CONVERTER ERROR")
        print(str(exc))
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )