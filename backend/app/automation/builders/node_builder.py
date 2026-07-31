from app.automation.workflow_models import WorkflowPlan
from app.automation.n8n_models import N8NWorkflow

from app.automation.builders.trigger_builder import build_trigger
from app.automation.builders.node_builder import build_node


def build_n8n_workflow(plan: WorkflowPlan):

    workflow = {
        "name": plan.name,
        "nodes": [],
        "connections": {},
    }

    # Build trigger
    trigger_node = build_trigger(plan.trigger)
    workflow["nodes"].append(trigger_node)

    node_id = 2
    created_nodes = ["Schedule Trigger"]

    # Build workflow nodes
    for step in plan.steps:

        node = build_node(step, node_id)

        if node is None:
            continue

        workflow["nodes"].append(node)
        created_nodes.append(node["name"])

        node_id += 1

    # Build sequential connections
    for i in range(len(created_nodes) - 1):

        source = created_nodes[i]
        target = created_nodes[i + 1]

        workflow["connections"][source] = {
            "main": [
                [
                    {
                        "node": target,
                        "type": "main",
                        "index": 0,
                    }
                ]
            ]
        }

    return N8NWorkflow.model_validate(workflow)