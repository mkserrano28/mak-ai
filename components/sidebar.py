
import streamlit as st


def render_sidebar():


        # LOGO
        st.markdown(
            """
            ## 🤖 Mak-AI

            <p style="
                margin-top:-10px;
                color:#94a3b8;
                font-size:13px;
            ">
                AI Assistant
            </p>
            """,
            unsafe_allow_html=True
        )
        # NEW CHAT 
        if st.button(
            "➕ New Chat",
            use_container_width=True,
            key="top_newchat_btn"
        ):

            st.session_state.current_chat = None

            st.rerun()
            
        st.markdown(
            """
            <div style="
                color:#94a3b8;
                font-size:12px;
                font-weight:600;
                letter-spacing:1px;
                margin-top:12px;
                margin-bottom:10px;
                padding-left:4px;
            ">
                SETTINGS
            </div>
            """,
            unsafe_allow_html=True
        )

        toggle_label = (
            "🌙"
            if st.session_state.theme == "dark"
            else "☀️"
        )

        dark_mode = st.toggle(
            toggle_label,
            value=(st.session_state.theme == "dark"),
            key="theme_toggle"
        )

        new_theme = "dark" if dark_mode else "light"

        if new_theme != st.session_state.theme:

            st.session_state.theme = new_theme

            st.rerun()


        st.markdown(
            "<div style='height:80px'></div>",
            unsafe_allow_html=True
        )   
            # WORKSPACE LABEL
        st.markdown(
            """
            <div style="
                color:#94a3b8;
                font-size:12px;
                font-weight:600;
                letter-spacing:1px;
                margin-top:25px;
                margin-bottom:14px;
                padding-left:4px;
            ">
                WORKSPACE
            </div>
            """,
            unsafe_allow_html=True
        )

        st.markdown(
            """
            <div class="sidebar-divider"></div>
            """,
            unsafe_allow_html=True
        )
        st.markdown(
            """
            <div style="
                color:#94a3b8;
                font-size:13px;
                margin-top:18px;
                margin-bottom:14px;
                font-weight:600;
            ">
                Chat History
            </div>
            """,
            unsafe_allow_html=True
        )
        st.markdown(
        """
        <div class="chat-history-scroll">
        """,
        unsafe_allow_html=True
    )

        # CHAT HISTORY

        for i, chat_name in enumerate(
            reversed(list(st.session_state.chats.keys()))
        ):

            active = (
                chat_name == st.session_state.current_chat
            )
            # HIDE EMPTY CHATS
            if (
                len(st.session_state.chats[chat_name]) == 0
                and chat_name != st.session_state.current_chat
            ):
                continue

            if st.button(
                chat_name,
                use_container_width=True,
                key=f"chat_{chat_name}"
            ):

                st.session_state.current_chat = chat_name

                st.rerun()