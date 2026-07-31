from collections import defaultdict

from app.services.vectorstore import search_documents
from app.services.bm25store import bm25_search


def build_sources(results):

    pages = defaultdict(set)

    for item in results:
        pages[item["filename"]].add(item["page"])

    sources = []

    for filename, page_set in pages.items():
        sources.append({
            "filename": filename,
            "pages": sorted(page_set),
        })

    return sources


def build_context(
    query,
    document_ids=None,
):

    faiss_results = search_documents(
        query,
        document_ids=document_ids,
    )

    bm25_results = bm25_search(
        query,
        document_ids=document_ids,
    )

    results = faiss_results.copy()

    seen = {
        (
            item["filename"],
            item["page"],
            item["text"],
        )
        for item in results
    }

    for item in bm25_results:

        key = (
            item["filename"],
            item["page"],
            item["text"],
        )

        if key not in seen:
            results.append(item)
            seen.add(key)

    grouped = defaultdict(list)

    for item in results:
        grouped[item["filename"]].append(item)

    context = ""

    for filename, chunks in grouped.items():

        context += f"\n========== {filename} ==========\n\n"

        for chunk in chunks:
            context += f"""
Page: {chunk['page']}

{chunk['text']}

"""

    sources = build_sources(results)

    return context, sources, results