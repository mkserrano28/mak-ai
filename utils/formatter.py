import base64
import html
import re
from pypdf import PdfReader


def image_to_base64(image_file):

    return base64.b64encode(
        image_file.read()
    ).decode("utf-8")

def extract_pdf_text(pdf_file):

    reader = PdfReader(pdf_file)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text
def chunk_text(text, chunk_size=500):

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        chunk_size
    ):
        chunks.append(
            " ".join(
                words[i:i+chunk_size]
            )
        )

    return chunks
def format_ai_content(content):

    code_blocks = []

    # EXTRACT FENCED CODE BLOCKS
    def extract_code(match):

        language = match.group(1) or ""

        code = html.escape(match.group(2).strip())

        placeholder = f"__CODE_BLOCK_{len(code_blocks)}__"

        block = f"""
<div class="custom-code-wrapper">
<pre><code class="{language}">{code}</code></pre>
</div>
"""

        code_blocks.append(block)

        return placeholder

    content = re.sub(
        r"```([\w#+-]*)?\s*\n([\s\S]*?)```",
        extract_code,
        content,
        flags=re.DOTALL
    )
    # FIX BROKEN CODE FENCES
    content = re.sub(
        r"``\s*\n",
        "```\\n",
        content
    )
    # ESCAPE SCRIPT TAGS ONLY
    content = content.replace(
        "<script",
        "&lt;script"
    )

    content = content.replace(
        "</script>",
        "&lt;/script&gt;"
    )

    # HEADINGS
    content = re.sub(
        r"(?m)^### (.+)$",
        r"<h3>\1</h3>",
        content
    )

    content = re.sub(
        r"(?m)^## (.+)$",
        r"<h2>\1</h2>",
        content
    )

    # BOLD
    content = re.sub(
        r"\*\*(.*?)\*\*",
        r"<strong>\1</strong>",
        content
    )

    # INLINE CODE
    # ONLY SIMPLE INLINE CODE
    content = re.sub(
        r"`([a-zA-Z0-9_().,#\-\s]+?)`",
        r"<code>\1</code>",
        content
    )

    # LINE BREAKS
    content = content.replace("\n", "<br>")

    # RESTORE CODE BLOCKS
    for i, block in enumerate(code_blocks):

        content = content.replace(
            f"__CODE_BLOCK_{i}__",
            block
        )
    return content
