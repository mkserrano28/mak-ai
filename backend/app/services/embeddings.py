from sentence_transformers import SentenceTransformer

_model = None


def get_model():
    global _model

    if _model is None:
        print("Loading embedding model...")

        _model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    return _model


def embed_texts(texts: list[str]):
    model = get_model()

    return model.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )