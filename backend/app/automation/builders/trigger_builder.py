from app.automation.workflow_models import WorkflowTrigger

def build_trigger(trigger: WorkflowTrigger):

    if trigger.type == "schedule":

        return {
            "id": "1",
            "name": "Schedule Trigger",
            "type": "n8n-nodes-base.scheduleTrigger",
            "position": [0, 0],
            "parameters": trigger.parameters,
        }
    elif trigger.type == "manual":
        return {
            "parameters": {},
            "id": "manual-trigger",
            "name": "Manual Trigger",
            "type": "n8n-nodes-base.manualTrigger",
            "typeVersion": 1,
            "position": [100, 300],
    }

    raise ValueError(
        f"Unsupported trigger: {trigger.type}"
    )