# 🤖 Mak-AI

Mak-AI is an AI assistant built with Streamlit that lets users chat with documents and images. It supports Retrieval-Augmented Generation (RAG), document uploads, AI chat responses, and automated browser testing.

## Features

- AI chat interface built with Streamlit
- Upload and process PDF, TXT, DOCX, CSV, PNG, JPG, and JPEG files
- RAG workflow for document-based questions
- FAISS vector search for retrieving relevant document chunks
- SentenceTransformer embeddings
- Groq-powered AI responses
- Image upload support
- Dark mode UI
- Responsive chat interface
- Attachment management
- Automated UI testing with Playwright and pytest
- Test mode that prevents automated tests from calling the real Groq API

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend / UI | Streamlit, HTML, CSS |
| AI | Groq API, Llama models, GPT4All |
| RAG | FAISS, SentenceTransformer |
| Document Processing | PyPDF2, python-docx, pytesseract |
| Testing | pytest, Playwright |
| Deployment | Railway |
| Version Control | Git, GitHub |

## Project Structure

```text
mak-ai/
├── app.py
├── components/
├── services/
│   ├── chat_service.py
│   ├── groq_service.py
│   ├── rag_service.py
│   └── payload_builder.py
├── tests/
│   ├── fixtures/
│   │   └── sample.txt
│   └── test_makai_ui.py
├── requirements.txt
├── .gitignore
└── README.md
