# Mak-AI

> An AI-powered workspace for intelligent conversations, document analysis, AI agents, and AI-generated n8n workflow automation.

Mak-AI is a full-stack AI platform designed to bring **AI chat, document intelligence, AI agents, and workflow automation** into a single workspace.

Built with **React, FastAPI, PostgreSQL, LangGraph, and n8n**, Mak-AI can understand natural-language automation requests and **generate n8n workflows** that users can use to automate business processes and connect external applications and services.

For example, a user can ask:

> "Create a workflow that receives a new invoice, extracts the invoice data, saves it to PostgreSQL, and sends a Slack notification."

Mak-AI can translate that request into a structured **n8n workflow**, reducing the need to manually build every automation node by node.

Mak-AI is evolving beyond a traditional AI chatbot into an **AI-powered workflow builder and automation platform**.

---

## Features

### AI Chat

- Modern conversational AI interface
- Persistent chat conversations
- Multiple chat sessions
- Chat search
- Rename and delete conversations
- AI response/loading states
- Responsive desktop and mobile interface

### User Accounts

- User registration and login
- JWT-based authentication
- User profile management
- Subscription plan support
- Free and Pro plan architecture

### Workspaces

- Create and manage workspaces
- Organize chats and documents
- Workspace-based AI context
- Foundation for collaborative AI workflows

### Document Intelligence

Mak-AI supports document-oriented AI workflows such as:

- PDF analysis
- Document uploads
- Context-aware document conversations
- AI-assisted information extraction
- Document organization within workspaces

### AI Tools

Mak-AI is being designed as more than a chatbot.

The interface provides access to AI capabilities such as:

- Analyze PDF
- Web Search
- Generate Presentations
- Invoice AI
- AI Vision
- AI Agents

### AI Workflow Builder

Mak-AI includes an evolving visual workflow system for building AI-powered automations.

Workflow nodes include:

- Schedule Trigger
- Webhook
- PostgreSQL
- MySQL
- MongoDB
- AI Agent
- OpenAI
- Slack
- Gmail

The workflow architecture is designed to allow AI agents and external services to be connected into reusable business processes.



### AI-Generated n8n Workflows

- Generate n8n workflows from natural-language prompts
- Convert business requirements into workflow structures
- Generate connected workflow nodes automatically
- Create webhook and scheduled automations
- Generate workflows involving APIs, databases, and external services
- Support integrations such as Gmail, Slack, PostgreSQL, and HTTP APIs
- Use AI agents to help design more complex automation workflows

## Tech Stack

| Category | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM / Database Layer | SQLAlchemy |
| AI Orchestration | LangGraph |
| AI / LLM | LLM API integrations |
| Authentication | JWT |
| Email | Resend |
| Workflow UI | React Flow |
| API Communication | REST API |
| Version Control | Git, GitHub |

---

## Architecture

Mak-AI follows a separated frontend/backend architecture:

```text
                     ┌──────────────────────┐
                     │      React + Vite    │
                     │       Frontend       │
                     └──────────┬───────────┘
                                │
                           REST API
                                │
                     ┌──────────▼───────────┐
                     │       FastAPI        │
                     │       Backend        │
                     └──────┬────────┬──────┘
                            │        │
                   ┌────────▼───┐ ┌──▼───────────┐
                   │ PostgreSQL │ │   LangGraph  │
                   │  Database  │ │ AI Workflows │
                   └────────────┘ └──────┬───────┘
                                         │
                                  ┌──────▼──────┐
                                  │ LLM / Tools │
                                  │ AI Services │
                                  └─────────────┘
```

---

## Project Structure

```text
mak-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── core/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

> The exact structure may evolve as Mak-AI's agent and workflow architecture expands.

---

# Getting Started

## Prerequisites

Install the following before running Mak-AI:

- Python 3.11+
- Node.js
- npm
- PostgreSQL
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/mkserrano28/mak-ai.git
cd mak-ai
```

---

# Backend Setup

## 2. Go to the Backend

```bash
cd backend
```

## 3. Create a Virtual Environment

### Windows

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Configure Environment Variables

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

Do not commit `.env` files or API keys to GitHub.

---

## 6. Start PostgreSQL

Make sure your PostgreSQL server is running and that the Mak-AI database exists.

Example database:

```text
makai
```

---

## 7. Run the Backend

From the `backend` directory:

```bash
python -m uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal.

## 8. Go to the Frontend

```bash
cd frontend
```

## 9. Install Dependencies

```bash
npm install
```

## 10. Run the Frontend

```bash
npm run dev
```

Vite will normally start Mak-AI at:

```text
http://localhost:5173
```

---

# Running Mak-AI Locally

For local development, you will normally have three services running:

```text
PostgreSQL
     │
     ▼
FastAPI Backend
http://127.0.0.1:8000
     │
     ▼
React Frontend
http://localhost:5173
```

---

# AI Workflow System

Mak-AI is evolving from a traditional AI chatbot into an **AI automation platform**.

The workflow system is designed around:

```text
Trigger
   ↓
AI Agent
   ↓
Tool / Database / API
   ↓
Decision
   ↓
Action
```

Example:

```text
New Invoice
     ↓
Extract Invoice Data
     ↓
AI Validation
     ↓
PostgreSQL
     ↓
Approval Decision
     ↓
Send Notification
```

LangGraph provides the orchestration layer for stateful and multi-step AI workflows.

---

# Security

Mak-AI follows several basic application security practices:

- Password hashing
- JWT authentication
- Protected API endpoints
- Environment-based secrets
- Database-backed user accounts
- CORS configuration
- Authentication-aware frontend routes

Sensitive information should always remain inside environment variables.

Never commit:

```text
.env
API keys
database passwords
JWT secrets
email service credentials
```

---

# Roadmap

Mak-AI is under active development.

Planned and ongoing improvements include:

- Advanced LangGraph agents
- Visual AI workflow builder
- Workflow execution engine
- Multi-agent workflows
- Human-in-the-loop approvals
- Improved RAG architecture
- Vector database integration
- Advanced document intelligence
- AI-generated presentations
- Invoice automation
- AI vision workflows
- Web search integration
- Gmail integration
- Slack integration
- Scheduled workflows
- Workflow execution history
- Usage tracking
- Production subscription and billing
- Team workspaces
- Cloud deployment
- CI/CD pipeline
- Automated backend and frontend testing

---

# Vision

Mak-AI aims to become more than an AI chat application.

The goal is to provide a workspace where users can:

**Ask → Analyze → Build → Automate → Execute**

from one AI-powered platform.

---

## Author

**Mark Serrano**

Software Engineer | AWS Certified Solutions Architect – Associate

LinkedIn:  
https://www.linkedin.com/in/mark-serrano-520299250

---

## Project Status

🚧 **Mak-AI is currently under active development.**

The architecture, AI agents, workflow system, and integrations will continue to evolve as new capabilities are added.
