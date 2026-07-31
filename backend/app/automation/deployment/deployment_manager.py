from app.automation.builders.n8n_builder import build_n8n_workflow
from app.automation.deployment.n8n_client import N8NClient
from app.automation.workflow_models import WorkflowPlan
from app.automation.deployment.credential_manager import CredentialManager


class DeploymentManager:

    def __init__(self):
        self.client = N8NClient()
        self.credential_manager = CredentialManager()

    def deploy(self, plan: WorkflowPlan):

        # 1. Build n8n workflow
        workflow = build_n8n_workflow(plan)

        # 2. Inject credentials
        workflow = self.credential_manager.inject_credentials(
            workflow
        )

        # 3. Create workflow in n8n
        result = self.client.create_workflow(workflow)

        workflow_id = result["id"]
        version_id = result["versionId"]

        # 4. Activate workflow
        self.client.activate_workflow(
            workflow_id,
            version_id,
        )

        return {
            "workflow_id": workflow_id,
            "status": "active",
        }