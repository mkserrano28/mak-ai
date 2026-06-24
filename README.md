# 🤖 Mak-AI

> An AI-powered document and image assistant built with Streamlit, RAG, FAISS, and Groq.

Mak-AI allows users to upload documents or images and ask questions through a responsive chat interface. It uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant content from uploaded files before generating an AI response.

## ✨ Features

*  AI chat interface built with Streamlit
*  Upload and process PDF, TXT, DOCX, and CSV files
*  Upload PNG, JPG, and JPEG images
*  Retrieval-Augmented Generation (RAG) for document-based questions
*  FAISS vector search to retrieve relevant document chunks
*  SentenceTransformer embeddings for semantic search
*  Groq-powered AI responses using Llama models
*  Image attachment support in chat
*  Dark mode interface
*  Responsive UI for desktop, tablet, and mobile
*  Attachment preview and removal
*  Automated UI testing with Playwright and pytest
*  Test mode that prevents automated tests from calling the real Groq API

## 🛠️ Tech Stack

| Category            | Technologies                     |
| ------------------- | -------------------------------- |
| Frontend / UI       | Streamlit, HTML, CSS             |
| AI / LLM            | Groq API, Llama models, GPT4All  |
| RAG                 | FAISS, SentenceTransformer       |
| Document Processing | PyPDF2, python-docx, pytesseract |
| Testing             | pytest, Playwright               |
| Deployment          | Railway                          |
| Version Control     | Git, GitHub                      |

## 📂 Project Structure

```text
mak-ai/
├── app.py
├── components/
│   ├── chat_renderer.py
│   ├── sidebar.py
│   └── uploader.py
├── services/
│   ├── chat_service.py
│   ├── groq_service.py
│   ├── payload_builder.py
│   └── rag_service.py
├── tests/
│   ├── fixtures/
│   │   └── sample.txt
│   └── test_makai_ui.py
├── requirements.txt
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/mak-ai.git
cd mak-ai
```

### 2. Create and activate a virtual environment

#### Windows PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> Never commit your `.env` file or API key to GitHub.

### 5. Run Mak-AI locally

```bash
streamlit run app.py
```

Then open the local URL shown in your terminal, usually:

```text
http://localhost:8501
```

## 🧪 Running Tests

Mak-AI uses **pytest** and **Playwright** for automated UI testing.

Run the tests with:

```bash
pytest tests/test_makai_ui.py
```

The application supports a test mode so automated tests can validate the UI without making real requests to the Groq API.

## 🧠 How RAG Works

1. The user uploads a document.
2. Mak-AI extracts the text from the file.
3. The text is split into smaller chunks.
4. SentenceTransformer converts the chunks into embeddings.
5. FAISS stores and searches the embeddings.
6. When the user asks a question, Mak-AI retrieves the most relevant chunks.
7. The retrieved context is sent to the AI model to generate a more accurate answer.

## 🌐 Deployment

Mak-AI is deployed using Railway.

Add your live application link here:

```text
https://your-mak-ai-production-url.up.railway.app
```

## 🔮 Future Improvements

* Support for multiple document collections
* Conversation history persistence
* User authentication
* Chat export functionality
* Streaming AI responses
* Better OCR support for scanned PDFs
* Improved document preview
* CI/CD pipeline for automated testing and deployment

## 👨‍💻 Author

**Mark Serrano**

* GitHub: https://github.com/YOUR-USERNAME
* LinkedIn: https://www.linkedin.com/in/mark-serrano-520299250

---

⭐ If you found this project useful, consider giving it a star!
