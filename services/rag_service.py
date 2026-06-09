import numpy as np
import faiss

from utils.formatter import (
    extract_pdf_text,
    chunk_text
)

def search_context(
    query,
    embedding_model,
    index,
    chunks,
    metadata,
    top_k=5
):

    query_embedding = np.array(
        embedding_model.encode([query]),
        dtype="float32"
    )

    top_k = min(
        top_k,
        len(chunks)
    )

    D, I = index.search(
        query_embedding,
        k=top_k
    )

    context_parts = []

    for idx in I[0]:

        pdf_name = metadata[idx]["pdf_name"]

        chunk = chunks[idx]

        context_parts.append(
            f"""
PDF: {pdf_name}

{chunk}
"""
        )

    return "\n\n".join(
        context_parts
    )

def build_faiss_index(
    pdf_files,
    embedding_model
):

    all_chunks = []
    all_embeddings = []
    metadata = []

    for pdf in pdf_files:

        pdf_text = extract_pdf_text(pdf)

        chunks = chunk_text(pdf_text)

        if not chunks:
            continue

        embeddings = np.array(
            embedding_model.encode(chunks),
            dtype="float32"
        )

        for i, chunk in enumerate(chunks):

            all_chunks.append(chunk)

            all_embeddings.append(
                embeddings[i]
            )

            metadata.append({
                "pdf_name": pdf.name
            })

    if not all_embeddings:
        return None, None, None

    all_embeddings = np.array(
        all_embeddings,
        dtype="float32"
    )

    index = faiss.IndexFlatL2(
        all_embeddings.shape[1]
    )

    index.add(all_embeddings)

    return (
        all_chunks,
        metadata,
        index
    )