def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 150,
):
    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - overlap

    return chunks