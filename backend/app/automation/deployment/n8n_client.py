import requests
import json
from app.config import settings
from app.automation.n8n_models import N8NWorkflow


class N8NClient:

    def __init__(self):
        self.base_url = f"{settings.N8N_URL}/api/v1"

        self.headers = {
            "X-N8N-API-KEY": settings.N8N_API_KEY,
            "Content-Type": "application/json",
        }

    def create_workflow(self, workflow: N8NWorkflow):
        url = f"{self.base_url}/workflows"

        payload = workflow.model_dump()

        print("\n========== WORKFLOW JSON ==========")
        print(json.dumps(payload, indent=2))

        response = requests.post(
            url,
            json=payload,
            headers=self.headers,
            timeout=30,
        )

        print("\n========== N8N RESPONSE ==========")
        print("Status:", response.status_code)
        print("Body:", response.text)

        if not response.ok:
            raise Exception(
                f"n8n returned {response.status_code}\n\n{response.text}"
            )

        return response.json()


    def activate_workflow(self, workflow_id: str, version_id: str):

        response = requests.post(
            f"{self.base_url}/workflows/{workflow_id}/activate",
            headers=self.headers,
            json={
                "versionId": version_id
            },
            timeout=30,
        )

        print("Activate Status:", response.status_code)
        print("Activate Response:", response.text)

        return response
    
    def list_credentials(self):

        response = requests.get(
            f"{self.base_url}/credentials",
            headers=self.headers,
            timeout=30,
        )

        print("Credentials Status:", response.status_code)
        print("Credentials Response:", response.text)

        response.raise_for_status()

        data = response.json()

        # Handle both possible response formats
        if isinstance(data, dict) and "data" in data:
            return data["data"]

        return data
    
    def get_workflow(self, workflow_id: str):

        response = requests.get(
            f"{self.base_url}/workflows/{workflow_id}",
            headers=self.headers,
            timeout=30,
        )

        print("Get Workflow Status:", response.status_code)
        print("Get Workflow Response:")
        print(response.text)

        response.raise_for_status()

        return response.json()