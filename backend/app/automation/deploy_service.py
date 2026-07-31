import json
from pathlib import Path

from app.automation.n8n_models import N8NWorkflow


DEPLOYMENT_FOLDER = Path("storage/workflows")


def deploy_mock(workflow: N8NWorkflow):

    DEPLOYMENT_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = DEPLOYMENT_FOLDER / f"{workflow.name}.json"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(
            workflow.model_dump_json(indent=4)
        )

    return {
        "status": "success",
        "mode": "mock",
        "file": str(filename),
    }