from app.automation.workflow_models import WorkflowPlan


def build_preview(plan: WorkflowPlan):

    preview = {
        "name": plan.name,
        "description": plan.description,
        "trigger": plan.trigger.model_dump(),
        "steps": [],
    }

    for i, step in enumerate(plan.steps, start=1):

        preview["steps"].append(
            {
                "order": i,
                "service": step.service,
                "action": step.action,
                "parameters": step.parameters,
            }
        )

    return preview