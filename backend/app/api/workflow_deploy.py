import os

import httpx
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.automation.deployment.n8n_client import (
    N8NClient,
)
from app.database.database import get_db
from app.database.models import User, Workflow
from app.services.n8n_converter import convert_to_n8n
from app.services.subscription_service import (
    require_feature,
)

router = APIRouter()

N8N_URL = os.getenv("N8N_URL", "http://localhost:5678")
N8N_API_KEY = os.getenv("N8N_API_KEY")


@router.post("/workflows/deploy")
async def deploy_workflow(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_feature(
        current_user,
        "workflow_deploy_enabled",
    )
    if not N8N_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="N8N_API_KEY is not configured",
        )
    workflow_id = payload.get("workflow_id")
    workflow_data = payload.get("workflow")

    db_workflow = None

    if workflow_id:
        db_workflow = (
            db.query(Workflow)
            .filter(
                Workflow.id == workflow_id,
                Workflow.user_id == current_user.id,
            )
            .first()
        )

        if not db_workflow:
            raise HTTPException(
                status_code=404,
                detail="Workflow not found",
            )

        workflow_data = db_workflow.workflow

    if not workflow_data:
        raise HTTPException(
            status_code=400,
            detail="Workflow is required",
        )

    converted = convert_to_n8n(
        workflow_data
    )
    # -----------------------------------------
    # Attach existing n8n credentials
    # -----------------------------------------

    n8n_client = N8NClient()
    credentials = n8n_client.list_credentials()

    credential_map = {
        credential["type"]: credential
        for credential in credentials
        if credential.get("type")
    }

    node_type_to_credential = {
        "n8n-nodes-base.postgres": "postgres",

        "n8n-nodes-base.gmail": "gmailOAuth2",
        "n8n-nodes-base.gmailTool": "gmailOAuth2",

        "n8n-nodes-base.googleCalendar": "googleCalendarOAuth2Api",
        "n8n-nodes-base.googleCalendarTool": "googleCalendarOAuth2Api",

        "n8n-nodes-base.googleTasks": "googleTasksOAuth2Api",
        "n8n-nodes-base.googleTasksTool": "googleTasksOAuth2Api",

        "@n8n/n8n-nodes-langchain.lmChatOpenAi": "openAiApi",
    }

    for node in converted["nodes"]:

        credential_type = node_type_to_credential.get(
            node.get("type")
        )

        if not credential_type:
            continue

        credential = credential_map.get(
            credential_type
        )

        if not credential:
            print(
                f"⚠ No credential found for "
                f"{node.get('name')} ({credential_type})"
            )
            continue

        node["credentials"] = {
            credential_type: {
                "id": credential["id"],
                "name": credential["name"],
            }
        }

        print(
            f"✓ Attached {credential_type} "
            f"to {node.get('name')}"
        )

    n8n_workflow = {
        "name": payload.get(
            "name",
            "IMAC-AI Workflow",
        ),
        "nodes": converted["nodes"],
        "connections": converted["connections"],
        "settings": {},
    }

    async with httpx.AsyncClient() as client:

        headers = {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
        }

        if db_workflow and db_workflow.n8n_workflow_id:

            response = await client.put(
                f"{N8N_URL}/api/v1/workflows/{db_workflow.n8n_workflow_id}",
                headers=headers,
                json=n8n_workflow,
                timeout=30,
            )

        else:

            response = await client.post(
                f"{N8N_URL}/api/v1/workflows",
                headers=headers,
                json=n8n_workflow,
                timeout=30,
            )

    if not response.is_success:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    result = response.json()

    # Save the n8n workflow ID into PostgreSQL
    if (
        db_workflow
        and not db_workflow.n8n_workflow_id
    ):
        db_workflow.n8n_workflow_id = result["id"]

        db.commit()
        db.refresh(db_workflow)

    return result


@router.post("/workflows/preview-n8n")
async def preview_n8n_workflow(payload: dict):
    workflow = payload.get("workflow")

    if not workflow:
        raise HTTPException(
            status_code=400,
            detail="Workflow is required",
        )

    converted = convert_to_n8n(workflow)

    print("CONVERTED:", converted)

    return {
        "name": payload.get("name", "IMAC-AI Workflow"),
        "nodes": converted["nodes"],
        "connections": converted["connections"],
        "settings": {},
    }