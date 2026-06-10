import streamlit as st

def scroll_to_bottom():
    st.markdown(
        """
        <script>
        setTimeout(function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        </script>
        """,
        unsafe_allow_html=True
    )