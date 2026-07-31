from app.automation.workflow_models import WorkflowPlan


SUPPORTED_SERVICES = {
    "postgres",
    "mysql",
    "snowflake",
    "gmail",
    "slack",
    "http",
    "csv",
}


SUPPORTED_ACTIONS = {
    "query",
    "send",
    "create",
    "insert",
    "update",
    "notify",
    "download",
}


def validate_workflow(plan: WorkflowPlan):
    errors = []

    if not plan.name:
        errors.append("Workflow name is missing.")

    if not plan.trigger.type:
        errors.append("Workflow trigger is missing.")

    for step in plan.steps:
        parameters = step.parameters or {}

        # -------------------------
        # Gmail
        # -------------------------
        if step.service == "gmail":
            operation = parameters.get(
                "operation",
                step.action,
            )

            # Only SEND requires recipient
            if operation in {"send", "notify"}:
                if not parameters.get("to"):
                    errors.append(
                        "Gmail send operation requires 'to'."
                    )

        # -------------------------
        # PostgreSQL
        # -------------------------
        if step.service == "postgres":
            operation = parameters.get(
                "operation",
                step.action,
            )

            if operation == "query":
                if not parameters.get("query"):
                    errors.append(
                        "Postgres query operation requires 'query'."
                    )

        # -------------------------
        # HTTP
        # -------------------------
        if step.service == "http":
            if not parameters.get("url"):
                errors.append(
                    "HTTP node requires 'url'."
                )

    return errors