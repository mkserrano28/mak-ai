import fitz


def extract_pdf_pages(file_path):
    pages = []

    with fitz.open(file_path) as pdf:
        for i, page in enumerate(pdf):
            pages.append({
                "page": i + 1,
                "text": page.get_text()
            })

    return pages