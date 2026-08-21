
import app.database.models

from app.api.chat import router as chat_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.database.database import Base
from app.database.database import engine
from app.api.chat_history import router as chat_history_router
from app.api.messages import router as message_router
from app.api.workspace import router as workspace_router
from app.api.document import router as document_router
from app.api.workflows import router as workflow_router
from app.api.workflow_deploy import router as workflow_deploy_router
from app.api.ai_workflow import router as ai_router
from app.api.auth import router as auth_router
from app.api import subscription
from app.api.ilaw import router as ilaw_router
from app.api.ppt import router as ppt_router
from app.api.quiz import router as quiz_router
from app.api.file_converter import router as file_converter_router
from app.api.chat import router as chat_router
from app.api.bamboozle import router as bamboozle_router
from app.api.exam_generator import router as exam_generator_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IMAC-AI API",
    version="1.0.0",
    openapi_version="3.0.3",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    chat_history_router,
    prefix="/api",
    tags=["Chat History"],
)

app.include_router(
    upload_router,
    prefix="/api",
    tags=["Upload"]
)

app.include_router(
    message_router,
    prefix="/api",
    tags=["Messages"],
)

app.include_router(
    chat_router,
    prefix="/api",
    tags=["Chat"],
)
app.include_router(
    workspace_router,
    prefix="/api",
    tags=["Workspace"],
)
app.include_router(
    document_router,
    prefix="/api",
    tags=["Documents"],
)
app.include_router(
    workflow_router,
    prefix="/api",
    tags=["Workflows"],
)
app.include_router(
    workflow_deploy_router,
    prefix="/api",
    tags=["Workflow Deployment"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(
    ai_router,
    prefix="/api/ai",
    tags=["AI Workflow"],
)
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"],
)
app.include_router(
    subscription.router,
    prefix="/api",
)
app.include_router(
    ilaw_router,
)
app.include_router(
    ppt_router,
    prefix="/api",
    tags=["PowerPoint"],
)
app.include_router(quiz_router)

app.include_router(file_converter_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    chat_router,
    prefix="/api",
    tags=["Chat"],
)

app.include_router(
    bamboozle_router,
    prefix="/api/bamboozle",
    tags=["Bamboozle"],
)

app.include_router(
    exam_generator_router,
    prefix="/api/exam-generator",
    tags=["Exam Generator"],
)