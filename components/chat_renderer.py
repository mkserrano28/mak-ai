# components/chat_renderer.py

import streamlit as st
import base64
import html

from st_copy_to_clipboard import (
    st_copy_to_clipboard
)

from utils.formatter import (
    format_ai_content
)


def render_chat(messages):

    for idx, msg in enumerate(messages):

        if msg["role"] == "user":

            if msg.get("pdf_name"):

                st.markdown(
                    f"""
                    <div class="chat-row-user">
                        <div
                            style="
                                background:rgba(255,255,255,0.08);
                                padding:12px 16px;
                                border-radius:14px;
                                color:{
                                    "white"
                                    if st.session_state.theme == "dark"
                                    else "#111827"
                                };
                                max-width:320px;
                            "
                        >
                            📄 {msg["pdf_name"]}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            st.markdown(
                '<div class="chat-row-user-image">',
                unsafe_allow_html=True
            )

            if msg.get("image_bytes"):

                img_b64 = base64.b64encode(
                    msg["image_bytes"]
                ).decode()

                st.markdown(
                    f"""
                    <div class="chat-row-user">
                        <img
                            src="data:image/png;base64,{img_b64}"
                            class="user-chat-image"
                        >
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            st.markdown(
                '</div>',
                unsafe_allow_html=True
            )

            st.markdown(
                f"""
                <div class="chat-row-user">
                    <div class="user-msg">
                        {html.escape(msg["content"])}
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        else:

            with st.container():

                st.markdown(
                    f"""
                    <div class="chat-row-ai">
                        <div class="ai-wrapper">
                            <div class="ai-message">
                                {format_ai_content(msg["content"])}
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

                st_copy_to_clipboard(
                    msg["content"],
                    before_copy_label="⧉",
                    after_copy_label="✔",
                    key=f"copy_{idx}"
                )

                generated = msg.get("generated_file")

                if generated:
                    with open(generated["path"], "rb") as f:
                        st.download_button(
                            label=f"📥 Download {generated['name']}",
                            data=f,
                            file_name=generated["name"],
                            mime=generated["mime"],
                            key=f"download_{idx}",
                        )