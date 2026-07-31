import faiss
import numpy as np
import os
import pickle

from app.services.embeddings import embed_texts
from app.services.bm25store import build_bm25

index = None
documents = []
STORAGE_DIR = "storage"

INDEX_PATH = os.path.join(
    STORAGE_DIR,
    "faiss.index",
)

METADATA_PATH = os.path.join(
    STORAGE_DIR,
    "metadata.pkl",
)


def add_document(
    document_id: int,
    filename: str,
    page: int,
    chunks: list[str],
):
    global index, documents

    vectors = embed_texts(chunks).astype("float32")

    if index is None:
        index = faiss.IndexFlatIP(vectors.shape[1])

    index.add(vectors)

    for chunk in chunks:
        documents.append({
            "document_id": document_id,
            "filename": filename,
            "page": page,
            "text": chunk,
        })

    save_index()
    save_metadata()
    build_bm25(documents)


def search_documents(
    question: str,
    k: int = 8,
    document_ids=None,
):
    global index

    if index is None:
        return []

    query = embed_texts(
        [question]
    ).astype("float32")

    # Search more candidates when filtering
    search_k = k

    if document_ids:
        search_k = min(
            max(k * 10, 50),
            len(documents),
        )

    scores, ids = index.search(
        query,
        search_k,
    )

    allowed_ids = (
        {int(doc_id) for doc_id in document_ids}
        if document_ids
        else None
    )

    results = []

    for idx in ids[0]:

        if idx == -1:
            continue

        document = documents[idx]

        if allowed_ids is not None:
            stored_id = document.get("document_id")

            if stored_id is None:
                continue

            if int(stored_id) not in allowed_ids:
                continue

        results.append(document)

        if len(results) >= k:
            break

    return results

def save_index():

    global index

    if index is None:
        return

    os.makedirs(
        STORAGE_DIR,
        exist_ok=True,
    )

    faiss.write_index(
        index,
        INDEX_PATH,
    )

def save_metadata():

    os.makedirs(
        STORAGE_DIR,
        exist_ok=True,
    )

    with open(
        METADATA_PATH,
        "wb",
    ) as f:

        pickle.dump(
            documents,
            f,
        )

def load_index():

    global index

    if os.path.exists(INDEX_PATH):

        index = faiss.read_index(
            INDEX_PATH
        )

def load_metadata():

    global documents

    if os.path.exists(
        METADATA_PATH
    ):

        with open(
            METADATA_PATH,
            "rb",
        ) as f:

            documents = pickle.load(f)

        
def rebuild():

    global index
    global documents

    index = None
    documents = []

    save_index()
    save_metadata()

#load_index()
#load_metadata()
#build_bm25(documents)