# components/uploader.py

import streamlit as st

from services.rag_service import (
    build_faiss_index
)


def handle_uploads(
    embedding_model
):

    uploaded_files = st.file_uploader(
        "",
        type=["png", "jpg", "jpeg", "pdf"],
        accept_multiple_files=True,
        key=f"upload_{st.session_state.uploader_key}"
    )

    image_files = []
    pdf_files = []

    if uploaded_files:

        image_files = [
            f for f in uploaded_files
            if f.type.startswith("image/")
        ]

        pdf_files = [
            f for f in uploaded_files
            if f.type == "application/pdf"
        ]

        st.session_state.show_attachment_bar = True

    # IMAGE PROCESSING

    if image_files:

        image = image_files[0]

        st.session_state.pending_image = image

        image.seek(0)

        st.session_state.uploaded_image_bytes = (
            image.getvalue()
        )

        st.session_state.show_attachment_bar = True

    # PDF PROCESSING

    if pdf_files:

        chunks, metadata, index = (
            build_faiss_index(
                pdf_files,
                embedding_model
            )
        )

        if index is not None:

            st.session_state.all_chunks = chunks

            st.session_state.chunk_metadata = metadata

            st.session_state.faiss_index = index

            st.session_state.pdf_files = [
                pdf.name
                for pdf in pdf_files
            ]

            st.session_state.show_attachment_bar = True

    # ATTACHMENT BAR

    if st.session_state.show_attachment_bar:

        items = []

        if st.session_state.pending_image:

            items.append(
                f"📷 {st.session_state.pending_image.name}"
            )

        for pdf in st.session_state.pdf_files:

            items.append(
                f"📄 {pdf}"
            )

        if items:

            attachment_html = "<br>".join(items)

            st.markdown(
                f"""
                <div class="attachment-bar">
                    <div class="attachment-files">
                        {attachment_html}
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

            col1, col2 = st.columns([20, 1])

            with col2:

                remove_clicked = st.button(
                    "✕",
                    key="remove_attachment"
                )

                if remove_clicked:

                    st.session_state.pending_image = None

                    st.session_state.uploaded_image_bytes = None

                    st.session_state.pdf_files.clear()

                    st.session_state.show_attachment_bar = False

                    st.session_state.uploader_key += 1

                    st.rerun()

    return st.chat_input(
        "Ask IMAC-AI..."
    )