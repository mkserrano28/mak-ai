from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

import requests
from PIL import Image
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


MAX_FILE_SIZE = 25 * 1024 * 1024

GOTENBERG_URL = os.getenv(
    "GOTENBERG_URL",
    "http://localhost:3000",
).rstrip("/")

GOTENBERG_TIMEOUT = int(
    os.getenv("GOTENBERG_TIMEOUT", "180")
)


OFFICE_EXTENSIONS = {
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".odt",
    ".ods",
    ".odp",
}

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tiff",
}

TEXT_EXTENSIONS = {
    ".txt",
}

SUPPORTED_INPUTS = (
    OFFICE_EXTENSIONS
    | IMAGE_EXTENSIONS
    | TEXT_EXTENSIONS
    | {".pdf"}
)

SUPPORTED_OUTPUTS = {
    "pdf",
    "docx",
    "txt",
    "pptx",
}


def _safe_stem(filename: str) -> str:
    stem = Path(filename).stem

    safe = "".join(
        char
        if char.isalnum() or char in "-_ "
        else "_"
        for char in stem
    )

    return safe.strip()[:100] or "converted_file"


# ============================================================
# IMAGE → PDF
# ============================================================

def _image_to_pdf(
    source: Path,
    output: Path,
) -> Path:

    with Image.open(source) as image:

        if image.mode in ("RGBA", "LA", "P"):

            if image.mode == "P":
                image = image.convert("RGBA")

            background = Image.new(
                "RGB",
                image.size,
                "white",
            )

            if "A" in image.getbands():
                background.paste(
                    image,
                    mask=image.getchannel("A"),
                )
            else:
                background.paste(image)

            image = background

        else:
            image = image.convert("RGB")

        image.save(
            output,
            "PDF",
            resolution=150.0,
        )

    return output


# ============================================================
# TXT → PDF
# ============================================================

def _text_to_pdf(
    source: Path,
    output: Path,
) -> Path:

    text = source.read_text(
        encoding="utf-8",
        errors="replace",
    )

    pdf = canvas.Canvas(
        str(output),
        pagesize=letter,
    )

    _, height = letter

    left = 54
    top = height - 54
    line_height = 14
    max_chars = 95

    y = top

    lines = text.splitlines() or [""]

    for raw_line in lines:

        line = raw_line

        while len(line) > max_chars:

            pdf.drawString(
                left,
                y,
                line[:max_chars],
            )

            line = line[max_chars:]
            y -= line_height

            if y < 54:
                pdf.showPage()
                y = top

        pdf.drawString(
            left,
            y,
            line,
        )

        y -= line_height

        if y < 54:
            pdf.showPage()
            y = top

    pdf.save()

    return output


# ============================================================
# PDF → TXT
# ============================================================

def _pdf_to_txt(
    source: Path,
    output: Path,
) -> Path:

    reader = PdfReader(str(source))

    pages = []

    for page in reader.pages:
        pages.append(
            page.extract_text() or ""
        )

    output.write_text(
        "\n\n".join(pages),
        encoding="utf-8",
    )

    return output


# ============================================================
# PDF → WORD
# ============================================================

def _pdf_to_docx(
    source: Path,
    output: Path,
) -> Path:

    try:
        from pdf2docx import Converter
    except ImportError as exc:
        raise RuntimeError(
            "PDF to Word requires pdf2docx. "
            "Install it with: pip install pdf2docx"
        ) from exc

    converter = Converter(str(source))

    try:
        converter.convert(str(output))
    finally:
        converter.close()

    if not output.exists():
        raise RuntimeError(
            "PDF to Word did not create a DOCX file."
        )

    return output


# ============================================================
# OFFICE → PDF USING GOTENBERG
# ============================================================

def _office_to_pdf(
    source: Path,
    output: Path,
) -> Path:

    endpoint = (
        f"{GOTENBERG_URL}"
        "/forms/libreoffice/convert"
    )

    try:

        with source.open("rb") as source_file:

            response = requests.post(
                endpoint,
                files={
                    "files": (
                        source.name,
                        source_file,
                        "application/octet-stream",
                    )
                },
                data={
                    "skipEmptyPages": "true",
                },
                timeout=GOTENBERG_TIMEOUT,
            )

    except requests.RequestException as exc:

        raise RuntimeError(
            "Mak-AI could not connect to Gotenberg. "
            "Make sure the Gotenberg Docker container "
            "is running."
        ) from exc

    if response.status_code != 200:

        detail = response.text.strip()

        if len(detail) > 500:
            detail = detail[:500]

        raise RuntimeError(
            "Gotenberg conversion failed "
            f"(HTTP {response.status_code}). "
            f"{detail}"
        )

    output.write_bytes(response.content)

    if (
        not output.exists()
        or output.stat().st_size == 0
    ):
        raise RuntimeError(
            "Gotenberg returned an empty PDF."
        )

    return output


# ============================================================
# MAIN CONVERTER
# ============================================================

def convert_file(
    file_bytes: bytes,
    filename: str,
    target_format: str,
):

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(
            "File is too large. "
            "Maximum size is 25 MB."
        )

    input_extension = (
        Path(filename)
        .suffix
        .lower()
    )

    target = (
        target_format
        .lower()
        .lstrip(".")
    )

    if input_extension not in SUPPORTED_INPUTS:
        raise ValueError(
            f"Unsupported input file type: "
            f"{input_extension or 'unknown'}"
        )

    if target not in SUPPORTED_OUTPUTS:
        raise ValueError(
            f"Unsupported output format: {target}"
        )

    # Temporary directory for this conversion
    temp_dir = Path(
        tempfile.mkdtemp(
            prefix="makai-convert-"
        )
    )

    try:

        output_dir = temp_dir / "output"
        output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        source = (
            temp_dir
            / f"input{input_extension}"
        )

        source.write_bytes(file_bytes)

        stem = _safe_stem(filename)

        # ----------------------------------------------------
        # TXT → PDF
        # ----------------------------------------------------

        if (
            input_extension == ".txt"
            and target == "pdf"
        ):

            output = _text_to_pdf(
                source,
                output_dir / f"{stem}.pdf",
            )

        # ----------------------------------------------------
        # PDF → TXT
        # ----------------------------------------------------

        elif (
            input_extension == ".pdf"
            and target == "txt"
        ):

            output = _pdf_to_txt(
                source,
                output_dir / f"{stem}.txt",
            )

        # ----------------------------------------------------
        # PDF → Word
        # ----------------------------------------------------

        elif (
            input_extension == ".pdf"
            and target == "docx"
        ):

            output = _pdf_to_docx(
                source,
                output_dir / f"{stem}.docx",
            )

        # ----------------------------------------------------
        # JPG / PNG → PDF
        # ----------------------------------------------------

        elif (
            input_extension in IMAGE_EXTENSIONS
            and target == "pdf"
        ):

            output = _image_to_pdf(
                source,
                output_dir / f"{stem}.pdf",
            )

        # ----------------------------------------------------
        # Word / PowerPoint / Excel → PDF
        # ----------------------------------------------------

        elif (
            input_extension in OFFICE_EXTENSIONS
            and target == "pdf"
        ):

            output = _office_to_pdf(
                source,
                output_dir / f"{stem}.pdf",
            )

        else:

            raise ValueError(
                f"Conversion from "
                f"{input_extension.upper()} to "
                f"{target.upper()} is not currently "
                "supported."
            )

        # Read converted file into memory
        converted_bytes = output.read_bytes()

        output_filename = output.name

        return converted_bytes, output_filename

    finally:

        # Always remove temporary files
        shutil.rmtree(
            temp_dir,
            ignore_errors=True,
        )