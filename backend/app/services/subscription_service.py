from fastapi import HTTPException


PLAN_LIMITS = {
    "free": {
        "max_workspaces": 2,
        "max_workflows": 3,
        "max_documents_per_workspace": 5,
        "ai_chat_enabled": True,
        "workflow_deploy_enabled": False,
    },

    "pro": {
        "max_workspaces": 20,
        "max_workflows": 50,
        "max_documents_per_workspace": 50,
        "ai_chat_enabled": True,
        "workflow_deploy_enabled": True,
    },
}


def get_user_plan(user):
    plan = (user.subscription_plan or "free").lower()

    if plan not in PLAN_LIMITS:
        plan = "free"

    # A Pro account without an active subscription
    # should fall back to Free privileges.
    if (
        plan == "pro"
        and user.subscription_status != "active"
    ):
        plan = "free"

    return plan


def get_plan_limits(user):
    plan = get_user_plan(user)

    return PLAN_LIMITS[plan]


def require_feature(user, feature):
    limits = get_plan_limits(user)

    if not limits.get(feature, False):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PRO_REQUIRED",
                "message": (
                    "This feature requires Mak-AI Pro."
                ),
            },
        )


def require_under_limit(
    user,
    feature,
    current_count,
):
    limits = get_plan_limits(user)

    maximum = limits.get(feature)

    if maximum is None:
        return

    if current_count >= maximum:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PLAN_LIMIT_REACHED",
                "message": (
                    f"You have reached your "
                    f"{feature} limit."
                ),
                "limit": maximum,
            },
        )