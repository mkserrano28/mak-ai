<div align="center">

# ⚡ Mak-AI

### AI Chat • AI Agents • Workflow Automation

**An AI-powered workspace that can chat, analyze documents, run AI agents, and generate n8n workflows from natural language.**

</div>

---

## About Mak-AI

Mak-AI is a full-stack AI platform that combines **AI chat, document intelligence, AI agents, and workflow automation** in one workspace.

One of its core capabilities is generating **n8n workflows from natural-language requests**.

For example:

> "Create a workflow that receives an invoice, extracts the data, saves it to PostgreSQL, and sends a Slack notification."

Mak-AI can understand the request and generate the workflow structure automatically.

---

## ✨ Features

### 💬 AI Chat
- Conversational AI interface
- Persistent chat history
- Multiple conversations
- Chat search
- Responsive UI

### 🤖 AI Agents
- LangGraph-powered AI agents
- Multi-step AI workflows
- Tool execution
- Stateful conversations

### ⚡ n8n Workflow Generation
- Generate n8n workflows from natural language
- Automatically create and connect workflow nodes
- Webhook and scheduled workflows
- Database and API integrations
- Gmail and Slack automation

### 📄 Document Intelligence
- PDF analysis
- Document uploads
- Context-aware conversations
- AI information extraction

### 🗂 Workspaces
- Create multiple workspaces
- Organize chats and documents
- Workspace-specific AI context

### 🔐 User Accounts
- Registration and login
- JWT authentication
- User profiles
- Free and Pro subscription architecture

---

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| AI Orchestration | LangGraph |
| Workflow Automation | n8n |
| Workflow UI | React Flow |
| Authentication | JWT |
| Email | Resend |
| API | REST API, Webhooks |

---

## 🏗 Architecture

```text
             User
               │
               ▼
        React + Vite
          Frontend
               │
               ▼
           FastAPI
           Backend
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
 PostgreSQL LangGraph   n8n
             │          │
             ▼          ▼
         AI / LLM   Automations
                    & Integrations
```

**LangGraph** handles AI agent orchestration and multi-step AI processes.

**n8n** handles workflow automation and integrations, while Mak-AI can generate n8n workflows from user prompts.

---

## 📁 Project Structure

```text
mak-ai/
├── backend/
│   ├── app/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mkserrano28/mak-ai.git
cd mak-ai
```

### 2. Backend

```bash
cd backend

python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt

python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔑 Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/makai

SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60

LLM_API_KEY=your_api_key

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

> ⚠️ Never commit `.env` files, API keys, passwords, or secrets.

---

## 🔄 Example Workflow

```text
User Prompt
     │
     ▼
   Mak-AI
     │
     ▼
LangGraph Agent
     │
     ▼
Generate n8n Workflow
     │
     ▼
┌─────────┐
│ Webhook │
└────┬────┘
     ▼
┌────────────┐
│ AI Extract │
└────┬───────┘
     ▼
┌────────────┐
│ PostgreSQL │
└────┬───────┘
     ▼
┌───────────┐
│   Slack   │
└───────────┘
```

---

## 🗺 Roadmap

- [ ] Advanced AI agents
- [ ] Multi-agent workflows
- [ ] Advanced n8n workflow generation
- [ ] Workflow execution
- [ ] Workflow templates
- [ ] Improved RAG
- [ ] AI Vision
- [ ] Invoice automation
- [ ] Gmail and Slack integrations
- [ ] Team workspaces
- [ ] Production billing
- [ ] Cloud deployment
- [ ] CI/CD

---

## 🎯 Vision

> **AI shouldn't only answer questions — it should help automate the work that follows.**

<div align="center">

### Ask → Analyze → Build → Automate → Execute

</div>

---

## 👨‍💻 Author

**Mark Serrano**  
Software Engineer  
AWS Certified Solutions Architect – Associate

LinkedIn:  
https://www.linkedin.com/in/mark-serrano-520299250

---

<div align="center">

**🚧 Mak-AI is currently under active development.**

</div>
