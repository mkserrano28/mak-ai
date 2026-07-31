from app.automation.deployment.n8n_client import N8NClient


class CredentialManager:

    def __init__(self):
        self.client = N8NClient()

    def get_credentials(self):
        return self.client.list_credentials()

    def find(self, credential_type: str):
        credentials = self.get_credentials()

        for credential in credentials:
            if credential.get("type") == credential_type:
                return credential

        return None

    def inject_credentials(self, workflow):

        credentials = self.get_credentials()

        credential_map = {
            credential["type"]: credential
            for credential in credentials
            if credential.get("type")
        }

        # n8n node type -> n8n credential type
        node_type_to_credential = {

            # PostgreSQL
            "n8n-nodes-base.postgres":
                "postgres",

            # Standard Gmail
            "n8n-nodes-base.gmail":
                "gmailOAuth2",

            # Gmail AI Tool
            "n8n-nodes-base.gmailTool":
                "gmailOAuth2",

            # Google Calendar AI Tool
            "n8n-nodes-base.googleCalendarTool":
                "googleCalendarOAuth2Api",

            # Google Tasks AI Tool
            "n8n-nodes-base.googleTasksTool":
                "googleTasksOAuth2Api",

            # OpenAI Chat Model
            "@n8n/n8n-nodes-langchain.lmChatOpenAi":
                "openAiApi",
        }

        for node in workflow.nodes:

            credential_type = node_type_to_credential.get(
                node.type
            )

            # Node doesn't require credentials
            if not credential_type:
                continue

            credential = credential_map.get(
                credential_type
            )

            if not credential:
                print(
                    f"⚠ No credential found for "
                    f"{node.name} ({credential_type})"
                )
                continue

            node.credentials = {
                credential_type: {
                    "id": credential["id"],
                    "name": credential["name"],
                }
            }

            print(
                f"✓ Attached {credential_type} "
                f"to {node.name}"
            )

        return workflow