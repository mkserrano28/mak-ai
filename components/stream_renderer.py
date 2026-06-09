# components/stream_renderer.py

import streamlit as st
import html
import re


def render_stream(
    response,
    formatter
):

    reply = ""

    message_placeholder = st.empty()

    for chunk in response:

        try:

            delta = chunk.choices[0].delta.content

        except Exception:
            continue

        if delta is None:
            continue

        if isinstance(delta, list):

            text_parts = []

            for item in delta:

                if isinstance(item, str):

                    text_parts.append(item)

                elif isinstance(item, dict):

                    if "text" in item:

                        text_parts.append(
                            str(item["text"])
                        )

                elif hasattr(item, "text"):

                    if isinstance(item.text, str):

                        text_parts.append(
                            item.text
                        )

            delta = "".join(text_parts)

            delta = re.sub(
                r",?\[object Object\],?",
                "",
                delta
            )

        if not isinstance(delta, str):
            delta = str(delta)

        if any(x in delta for x in [
            "[object Object]",
            "TextContent(",
            "tool_use",
            "tool_calls"
        ]):
            continue

        reply += delta

        streamed_text = html.escape(
            reply
        ).replace(
            "\n",
            "<br>"
        )

        message_placeholder.markdown(
            f'''
            <div class="chat-row-ai">
                <div class="ai-wrapper">
                    <div class="ai-message">
                        {streamed_text}
                    </div>
                </div>
            </div>
            ''',
            unsafe_allow_html=True
        )

    message_placeholder.markdown(
        f'''
        <div class="chat-row-ai">
            <div class="ai-wrapper">
                <div class="ai-message">
                    {formatter(reply)}
                </div>
            </div>
        </div>
        ''',
        unsafe_allow_html=True
    )

    return reply