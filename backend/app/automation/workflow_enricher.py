from app.automation.workflow_models import WorkflowPlan


def enrich_workflow(plan: WorkflowPlan) -> WorkflowPlan:

    previous_output = None

    for index, step in enumerate(plan.steps, start=1):

        # Generate stable ID
        step.id = f"step_{index}"

        # Connect outputs to inputs
        if previous_output:
            step.inputs = previous_output

        # Infer outputs based on action
        if step.action == "query":
            step.outputs = {
                "rows": f"{step.id}_rows"
            }

            previous_output = {
                "rows": f"{step.id}_rows"
            }

        elif step.action == "create":
            step.outputs = {
                "file": f"{step.id}_file"
            }

            previous_output = {
                "file": f"{step.id}_file"
            }

        elif step.action == "send":
            step.outputs = {}

            previous_output = None

    return plan