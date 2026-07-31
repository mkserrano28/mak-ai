from app.automation.n8n_models import N8NWorkflow



def build_workflow_preview(workflow: N8NWorkflow):

    nodes = []

    for node in workflow.nodes:
        nodes.append(
            {
                "id": node.id,
                "name": node.name,
                "type": node.type,
                "position": node.position,
                "parameters": node.parameters,
            }
        )

    return {
        "type": "workflow_preview",
        "workflow": {
            "name": workflow.name,
            "nodes": nodes,
            "connections": workflow.connections,
        },
    }