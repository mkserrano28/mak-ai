# utils/session.py

import streamlit as st

def initialize_session():

    defaults = {
        "chats": {},
        "current_chat": None,
        "show_attachment_bar": False,
        "pending_image": None,
        "uploaded_image_bytes": None,
        "all_chunks": [],
        "chunk_metadata": [],
        "faiss_index": None,
        "pdf_files": [],
        "uploader_key": 0,
        "last_pdf_name": None,
        "pdf_name": None,
        "theme": "light"
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value