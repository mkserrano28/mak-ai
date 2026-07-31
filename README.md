<div align="center">

# ✦ Mak-AI

### AI Chat • AI Agents • Intelligent Workflows • n8n Automation

**Mak-AI is an AI-powered workspace that turns natural language into conversations, insights, agents, and automated workflows.**

Built with **React • FastAPI • PostgreSQL • LangGraph • n8n**

<br />

`AI Chat` · `Document Intelligence` · `AI Agents` · `Workflow Builder` · `n8n Generation`

</div>

---

## ✨ What is Mak-AI?

Mak-AI is a full-stack **AI workspace and automation platform** designed to bring AI conversations, document intelligence, autonomous agents, and workflow automation into one unified experience.

Instead of manually building complex automations node by node, users can describe what they want in natural language.

> **"Create a workflow that receives a new invoice, extracts the invoice data, saves it to PostgreSQL, and sends a Slack notification."**

Mak-AI can interpret the request and generate a structured **n8n workflow** that connects the required services and automation steps.

The goal is simple:

<div align="center">

### Ask → Analyze → Build → Automate → Execute

</div>

---

# 🚀 Core Capabilities

## 💬 AI Chat

A modern AI conversation experience built directly into the Mak-AI workspace.

- Conversational AI interface
- Persistent conversations
- Multiple chat sessions
- Chat history search
- Rename and delete conversations
- AI response/loading states
- Responsive desktop and mobile interface

---

## 🧠 AI Agents

Mak-AI uses AI agents to handle more advanced tasks and multi-step operations.

- Stateful AI agents
- Tool-enabled agents
- Multi-step reasoning
- Conditional execution
- Agent-based workflow planning
- Foundation for multi-agent systems
- LangGraph-powered orchestration

---

## ⚡ AI-Generated n8n Workflows

One of Mak-AI's core capabilities is transforming **natural-language automation requests into n8n workflows**.

Instead of manually configuring every node, users can describe the automation they want Mak-AI to build.

### Example

```text
User Prompt
     │
     ▼
"Monitor incoming invoices,
extract their information,
store them in PostgreSQL,
and notify our Slack channel."
     │
     ▼
   Mak-AI
     │
     ▼
Understand Requirements
     │
     ▼
Generate Workflow Structure
     │
     ▼
Generate n8n Workflow
     │
     ▼
┌─────────┐
│ Webhook │
└────┬────┘
     ▼
┌─────────────┐
│ AI Extract  │
└──────┬──────┘
       ▼
┌────────────┐
│ PostgreSQL │
└─────┬──────┘
      ▼
┌───────────┐
│   Slack   │
└───────────┘
```

### Workflow Generation Features

- Generate n8n workflows from natural-language prompts
- Convert business requirements into workflow structures
- Automatically generate connected workflow nodes
- Generate webhook-based automations
- Generate scheduled workflows
- Connect APIs and databases
- Integrate third-party applications
- Generate AI-powered automation pipelines

Example integrations include:

`Gmail` · `Slack` · `PostgreSQL` · `MySQL` · `MongoDB` · `Webhooks` · `HTTP APIs`

---

## 🔀 Visual AI Workflow Builder

Mak-AI also provides a visual workflow environment for designing and understanding AI-powered processes.

Supported and planned workflow nodes include:

| Type | Examples |
| --- | --- |
| ⚡ Triggers | Schedule, Webhook |
| 🤖 AI | AI Agent, OpenAI |
| 🗄️ Databases | PostgreSQL, MySQL, MongoDB |
| 📨 Communication | Gmail, Slack |
| 🌐 APIs | HTTP Requests, Web Services |
| 🔀 Logic | Conditions, Routing, Decisions |

The workflow architecture allows AI agents, databases, APIs, and external services to participate in reusable business processes.

---

## 📄 Document Intelligence

Mak-AI provides AI-assisted document processing and analysis.

- PDF analysis
- Document uploads
- Context-aware document conversations
- AI-assisted information extraction
- Document organization
- Workspace-based document context

This architecture provides the foundation for advanced document workflows such as invoice processing, contract analysis, report extraction, and knowledge retrieval.

---

## 🛠 AI Tools

Mak-AI is designed as more than a chatbot.

Users can access AI capabilities such as:

| Tool | Purpose |
| --- | --- |
| 📄 Analyze PDF | Ask questions and extract information from documents |
| 🌐 Web Search | Retrieve information from the web |
| 📊 Generate PPT | Generate presentation content |
| 🧾 Invoice AI | Extract and process invoice information |
| 🖼️ AI Vision | Analyze images using AI |
| 🤖 AI Agents | Execute intelligent multi-step tasks |
| ⚡ Workflow AI | Generate automation workflows |

---

## 🗂 Workspaces

Workspaces provide an organizational layer for AI conversations, documents, and automation.

- Create and manage workspaces
- Organize chats
- Organize uploaded documents
- Workspace-specific AI context
- Foundation for team collaboration
- Foundation for workspace-specific agents

---

## 🔐 Authentication & Accounts

Mak-AI includes a database-backed authentication system.

- User registration
- User login
- JWT authentication
- Protected API endpoints
- User profiles
- Subscription architecture
- Free and Pro plan support

---

# 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| 🎨 Frontend | React, Vite, JavaScript |
| 💅 Styling | Tailwind CSS |
| ⚙️ Backend | Python, FastAPI |
| 🗄️ Database | PostgreSQL |
| 🔗 ORM | SQLAlchemy |
| 🧠 AI Orchestration | LangGraph |
| ⚡ Workflow Automation | n8n |
| 🔀 Workflow UI | React Flow |
| 🤖 AI / LLM | LLM API Integrations |
| 🔐 Authentication | JWT |
| ✉️ Email | Resend |
| 🌐 Communication | REST API, Webhooks |
| 🔧 Version Control | Git, GitHub |

---

# 🏗 Architecture

Mak-AI uses a separated frontend/backend architecture with dedicated AI and automation layers.

```text
┌───────────────────────────────────────────────┐
│                    USER                       │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   React + Vite   │
              │     Frontend     │
              └────────┬─────────┘
                       │
                    REST API
                       │
                       ▼
              ┌──────────────────┐
              │     FastAPI      │
              │     Backend      │
              └───────┬──────────┘
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
 ┌──────────────┐ ┌───────────┐ ┌──────────────┐
 │  PostgreSQL  │ │ LangGraph │ │    n8n       │
 │   Database   │ │ AI Agents │ │  Automation  │
 └──────────────┘ └─────┬─────┘ └──────┬───────┘
                        │              │
                        ▼              ▼
                 ┌────────────┐  ┌───────────────┐
                 │ LLM / AI   │  │ Integrations  │
                 │   Tools    │  │ APIs / Apps   │
                 └────────────┘  └───────────────┘
```

### Responsibilities

**React**

Handles the Mak-AI user interface, conversations, workspaces, workflow visualization, and user interactions.

**FastAPI**

Provides authentication, business logic, database communication, AI endpoints, and integration APIs.

**PostgreSQL**

Stores users, conversations, workspaces, documents, subscriptions, and application data.

**LangGraph**

Orchestrates stateful AI agents, tool execution, reasoning flows, and complex AI processes.

**n8n**

Provides workflow automation and third-party integration capabilities while enabling Mak-AI to generate reusable automation workflows.

---

# 🧠 AI + Automation Architecture

LangGraph and n8n serve different but complementary roles inside Mak-AI.

```text
              Natural Language
                     │
                     ▼
                 ┌───────┐
                 │Mak-AI │
                 └───┬───┘
                     │
                     ▼
              ┌─────────────┐
              │  LangGraph  │
              │  AI Agent   │
              └──────┬──────┘
                     │
              Understand / Plan
                     │
                     ▼
             ┌───────────────┐
             │ Workflow Spec │
             └───────┬───────┘
                     │
                     ▼
                ┌────────┐
                │  n8n   │
                └────┬───┘
                     │
          ┌──────────┼───────────┐
          │          │           │
          ▼          ▼           ▼
       Database    Gmail       Slack
          │
          ▼
         APIs
```

**LangGraph = AI reasoning and orchestration**

**n8n = workflow automation and integrations**

Together, they allow Mak-AI to move from simply **answering questions** to helping users **build and automate real processes**.

---

# 📁 Project Structure

```text
mak-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── n8n/
│   └── workflows/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

> The project structure will continue to evolve as Mak-AI's agent, workflow, and automation capabilities expand.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Python 3.11+
- Node.js
- npm
- PostgreSQL
- Git

---

## 1. Clone Mak-AI

```bash
git clone https://github.com/mkserrano28/mak-ai.git
cd mak-ai
```

---

# ⚙️ Backend Setup

## 2. Open the Backend

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

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

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

> ⚠️ Never commit `.env` files, API keys, passwords, or application secrets.

## 6. Start PostgreSQL

Make sure PostgreSQL is running and create the Mak-AI database.

Example:

```text
makai
```

## 7. Start FastAPI

```bash
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 💻 Local Development

During local development, the main application services are:

```text
              Browser
                 │
                 ▼
        React + Vite Frontend
        http://localhost:5173
                 │
                 ▼
          FastAPI Backend
       http://127.0.0.1:8000
                 │
                 ▼
            PostgreSQL
```

Additional AI and automation services connect through the backend as required.

---

# ⚡ Example Automation

A future end-to-end invoice workflow could look like:

```text
Invoice Uploaded
       │
       ▼
   Mak-AI Agent
       │
       ▼
Extract Invoice Data
       │
       ▼
Validate Information
       │
       ▼
   PostgreSQL
       │
       ▼
Generated n8n Workflow
       │
       ├─────────────┐
       ▼             ▼
   Send Email    Notify Slack
       │             │
       └──────┬──────┘
              ▼
          Completed
```

---

# 🔒 Security

Mak-AI follows standard application security practices including:

- Password hashing
- JWT authentication
- Protected API endpoints
- Environment-based secrets
- Database-backed accounts
- CORS configuration
- Authentication-aware frontend routes

### Never commit

```text
.env
API keys
Database passwords
JWT secrets
Email credentials
Production secrets
```

---

# 🗺️ Roadmap

Mak-AI is under active development.

### AI

- [ ] Advanced LangGraph agents
- [ ] Multi-agent systems
- [ ] Human-in-the-loop approvals
- [ ] Improved RAG architecture
- [ ] Vector database integration
- [ ] Advanced document intelligence
- [ ] AI vision workflows
- [ ] AI-generated presentations

### Automation

- [ ] Advanced n8n workflow generation
- [ ] n8n webhook integration
- [ ] LangGraph → n8n execution
- [ ] Workflow templates
- [ ] Workflow execution engine
- [ ] Scheduled workflows
- [ ] Workflow execution history
- [ ] Gmail automation
- [ ] Slack automation
- [ ] External API integrations

### Platform

- [ ] Usage tracking
- [ ] Production subscription and billing
- [ ] Team workspaces
- [ ] Collaboration
- [ ] Cloud deployment
- [ ] CI/CD
- [ ] Automated frontend testing
- [ ] Automated backend testing

---

# 🎯 Vision

Mak-AI is being built around a simple idea:

> **AI shouldn't only answer questions — it should help build and automate the work that follows.**

Mak-AI aims to provide one intelligent workspace where users can move from an idea to an executable process.

<div align="center">

### Ask → Analyze → Build → Automate → Execute

**One workspace. AI-powered.**

</div>

---

# 👨‍💻 Author

### Mark Serrano

**Software Engineer**  
**AWS Certified Solutions Architect – Associate**

LinkedIn:  
https://www.linkedin.com/in/mark-serrano-520299250

---

<div align="center">

## 🚧 Project Status

**Mak-AI is currently under active development.**

The AI agent architecture, workflow generation engine, integrations, and automation capabilities are continuously evolving.

<br />

### ⭐ If you find Mak-AI interesting, consider starring the repository.

</div>
