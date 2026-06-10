import streamlit as st
from sentence_transformers import SentenceTransformer
import html
import re

from utils.formatter import (
    image_to_base64,
    format_ai_content
)
from utils.session import initialize_session
from services.rag_service import (
    search_context
)
from components.sidebar import render_sidebar
from components.chat_renderer import (
    render_chat
)
from components.uploader import (
    handle_uploads
)
from services.chat_service import (
    build_messages_payload,
    get_model_name,
    create_chat_completion
)
from components.stream_renderer import (
    render_stream
)
from services.web_search import search_web


@st.cache_resource
def get_embedding_model():

    return SentenceTransformer(
        "all-MiniLM-L6-v2"
    )
def load_css(file_name):
    with open(file_name) as f:
        st.markdown(
            f"<style>{f.read()}</style>",
            unsafe_allow_html=True
        )
embedding_model = get_embedding_model()




# PAGE CONFIG

st.set_page_config(
    page_title="Mak-AI",
    page_icon="🤖",
    layout="wide"
)

initialize_session()
# THEME COLORS

if st.session_state.theme == "dark":

    background = "#0f172a"
    text = "white"

    app_background = """
    radial-gradient(
        circle at top left,
        rgba(59,130,246,0.18),
        transparent 25%
    ),

    radial-gradient(
        circle at bottom right,
        rgba(139,92,246,0.16),
        transparent 30%
    ),

    #0f172a
    """

else:

    background = "#eef2f7"
    text = "#111827"

    app_background = """
    radial-gradient(
        circle at top left,
        rgba(59,130,246,0.10),
        transparent 25%
    ),

    radial-gradient(
        circle at bottom right,
        rgba(168,85,247,0.08),
        transparent 30%
    ),

    #f8fafc
    """


theme_css = f"""
<style>
:root {{

    --app-background: {app_background};

    --bg-color: {background};

    --text-color: {text};

    --border-color: {
        "rgba(255,255,255,0.12)"
        if st.session_state.theme == "dark"
        else "#d1d5db"
    };

    --ai-message-bg: {
        "rgba(255,255,255,0.06)"
        if st.session_state.theme == "dark"
        else "#ffffff"
    };

    --placeholder-color: {
        "#9ca3af"
        if st.session_state.theme == "dark"
        else "#6b7280"
    };

}}
</style>
"""

st.markdown(
    theme_css,
    unsafe_allow_html=True
)

load_css("styles/main.css")
load_css("styles/sidebar.css")
load_css("styles/uploader.css")

with st.sidebar:
    render_sidebar()

messages = []

if st.session_state.current_chat:

    messages = st.session_state.chats.get(
        st.session_state.current_chat,
        []
    )
render_chat(messages)


prompt = handle_uploads(
    embedding_model
)

        

# USER MESSAGE

if prompt:

    if st.session_state.current_chat is None:

        new_title = prompt[:32].strip()

        if len(prompt) > 32:
            new_title += "..."

        st.session_state.chats[new_title] = []

        st.session_state.current_chat = new_title

        messages = st.session_state.chats[new_title]

    # ALWAYS SAVE USER MESSAGE

    messages.append({
        "role": "user",
        "content": prompt,
        "image_bytes": (
            st.session_state.uploaded_image_bytes
            if st.session_state.pending_image
            else None
        ),
        "pdf_name": (
            ", ".join(st.session_state.pdf_files)
            if st.session_state.show_attachment_bar
            else None
        )
    })

    # AI RESPONSE

    try:
        # BUILD MESSAGE PAYLOAD

        history = messages[:-1]

        context = None

        # PDF RAG
        if (
            not st.session_state.pending_image
            and st.session_state.all_chunks
            and st.session_state.faiss_index is not None
        ):
            context = search_context(
                prompt,
                embedding_model,
                st.session_state.faiss_index,
                st.session_state.all_chunks,
                st.session_state.chunk_metadata
            )

        # INTERNET SEARCH

        SEARCH_KEYWORDS = [
            "latest",
            "today",
            "news",
            "current",
            "recent",
            "update",
            "updates",
            "2025",
            "2026",
        ]

        needs_search = any(
            word in prompt.lower()
            for word in SEARCH_KEYWORDS
        )

        if needs_search:

            with st.spinner("🌐 Searching the web..."):

                web_results = search_web(prompt)

            web_context = "\n\n".join([
                f"Title: {r['title']}\n"
                f"Content: {r['content']}\n"
                f"Source: {r['url']}"
                for r in web_results
            ])

            search_context_text = f"""
        WEB SEARCH RESULTS

        {web_context}

        Instructions:
        - Use the search results to answer the user's question.
        - Prioritize the latest information.
        - Summarize information naturally.
        - Do not list every source verbatim.
        - Cite sources at the end when relevant.
        - Focus on answering the user's question directly.
        """

            if context:
                context += "\n\n" + search_context_text
            else:
                context = search_context_text

        messages_payload = build_messages_payload(
            history,
            prompt,
            context
        )        
           
        # ADD IMAGE IF EXISTS
        if st.session_state.pending_image:

            st.session_state.pending_image.seek(0)

            image_base64 = image_to_base64(
                st.session_state.pending_image
            )

            current_user_message = {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }

        else:

            current_user_message = {
                "role": "user",
                "content": prompt
            }

        messages_payload.append(
            current_user_message
        )
        model_name = get_model_name(
            st.session_state.pending_image is not None
        )
        response = create_chat_completion(
            messages_payload,
            model_name
        )
    except Exception as e:

        error_text = str(e)

        if "rate_limit_exceeded" in error_text:

            st.error(
                "⚠️ Daily Groq token limit reached.\n\n"
                "Please wait a few minutes or switch model."
            )

            st.stop()

        else:

            st.error(f"Error: {e}")

            st.stop()

    reply = render_stream(
        response,
        format_ai_content
    )

    messages.append({
        "role": "assistant",
        "content": reply
    })
    st.session_state.pending_image = None
    st.session_state.uploaded_image_bytes = None

    st.session_state.pdf_files.clear()

    st.session_state.show_attachment_bar = False
    st.session_state.uploader_key += 1

    st.rerun()