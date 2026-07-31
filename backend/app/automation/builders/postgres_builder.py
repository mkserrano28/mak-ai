from app.automation.workflow_models import WorkflowStep
from app.automation.n8n_models import N8NNode


def build_postgres_node(step):
    return N8NNode(
        id=step.id,
        type="n8n-nodes-base.postgres",
        name="Postgres",
        position=[450, 300],
        parameters={
            "operation": "executeQuery",
            "query": step.parameters.get("query", ""),
        },
        credentials={},
    )