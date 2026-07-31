from app.automation.workflow_models import WorkflowStep
from app.automation.n8n_models import N8NNode


def build_gmail_node(step: WorkflowStep):

    return N8NNode(
        id=step.id,
        name="Gmail",
        type="n8n-nodes-base.gmail",
        position=[900, 0],
        parameters={
            "resource": "message",
            "operation": "send",
            "sendTo": step.parameters.get("to", ""),
            "subject": step.parameters.get("subject", ""),
            "message": step.parameters.get("message", ""),
        },
        credentials={
            "gmailOAuth2": {
                "id": "",
                "name": "",
            }
        },
    )