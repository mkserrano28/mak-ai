from rank_bm25 import BM25Okapi

bm25 = None
documents = []


def build_bm25(docs):
    global bm25, documents

    documents = docs

    tokenized = [
        doc["text"].lower().split()
        for doc in docs
    ]

    bm25 = BM25Okapi(tokenized)


def bm25_search(
    query,
    k=5,
    document_ids=None,
):

    if bm25 is None:
        return []

    tokens = query.lower().split()

    scores = bm25.get_scores(tokens)

    ranked = sorted(
        enumerate(scores),
        key=lambda x: x[1],
        reverse=True,
    )

    allowed_ids = (
        {int(doc_id) for doc_id in document_ids}
        if document_ids
        else None
    )

    results = []

    for idx, score in ranked:

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