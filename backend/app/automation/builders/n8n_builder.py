from app.automation.workflow_models import WorkflowPlan
from app.automation.n8n_models import N8NWorkflow
from app.automation.builders.trigger_builder import build_trigger
from app.automation.builders.node_registry import NODE_BUILDERS



def build_n8n_workflow(plan: WorkflowPlan):

    workflow = {
        "name": plan.name,
        "nodes": [],
        "connections": {},
        "settings": {},
        "staticData": {},
        "pinData": {},
    }
    trigger_node = build_trigger(plan.trigger)
    workflow["nodes"].append(trigger_node)
    
    node_id = 2
    created_nodes = ["Schedule Trigger"]


    for step in plan.steps:

        builder = NODE_BUILDERS.get(step.service)

        if builder is None:
            print(f"No builder for {step.service}")
            continue

        node = builder(step)

        workflow["nodes"].append(node.model_dump(mode="json"))

        created_nodes.append(node.name)

        node_id += 1
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