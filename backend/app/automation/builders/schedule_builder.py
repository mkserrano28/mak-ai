from app.automation.n8n_models import N8NNode


def build_schedule_node(cron: str):

    return N8NNode(
        id="1",
        name="Schedule Trigger",
        type="n8n-nodes-base.scheduleTrigger",
        position=[0, 0],
        parameters={
            "rule": {
                "interval": [
                    {
                        "field": "cronExpression",
                        "expression": cron,
                    }
                ]
            }
        },
        credentials={},   # <-- Add this
    )