import os

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.paymongo_service import (
    create_customer,
    create_plan,
    create_subscription,
)
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)


from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.database.models import User
from app.services.subscription_service import (
    get_plan_limits,
    get_user_plan,
)


router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"],
)


@router.get("/me")
def get_my_subscription(
    current_user: User = Depends(get_current_user),
):
    plan = get_user_plan(current_user)

    return {
        "plan": plan,
        "status": current_user.subscription_status,
        "current_period_end": (
            current_user.subscription_current_period_end
        ),
        "cancel_at_period_end": (
            current_user.subscription_cancel_at_period_end
        ),
        "limits": get_plan_limits(current_user),
    }

@router.post("/checkout")
async def create_checkout(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    if (
        current_user.subscription_plan == "pro"
        and
        current_user.subscription_status
        == "active"
    ):
        raise HTTPException(
            status_code=400,
            detail="You already have Mak-AI Pro.",
        )

    plan_id = os.getenv(
        "PAYMONGO_PRO_PLAN_ID"
    )

    if not plan_id:
        raise HTTPException(
            status_code=500,
            detail=(
                "PayMongo Pro plan "
                "is not configured."
            ),
        )

    customer_id = (
        current_user.payment_customer_id
    )

    if not customer_id:
        customer = await create_customer(
            name=current_user.name,
            email=current_user.email,
        )

        customer_id = customer["id"]

        current_user.payment_customer_id = (
            customer_id
        )

        db.commit()

    subscription = (
        await create_subscription(
            customer_id=customer_id,
            plan_id=plan_id,
        )
    )

    current_user.payment_subscription_id = (
        subscription["id"]
    )

    # IMPORTANT:
    # Do NOT make the user Pro yet.
    current_user.subscription_status = (
        "incomplete"
    )

    db.commit()

    attributes = subscription.get(
        "attributes",
        {},
    )

    latest_invoice = attributes.get(
        "latest_invoice",
        {},
    )

    payment_intent = latest_invoice.get(
        "payment_intent",
        {},
    )

    setup_intent = attributes.get(
        "setup_intent",
        {},
    )

    return {
        "subscription_id": subscription["id"],
        "status": attributes.get(
            "status"
        ),
        "payment_intent_id": (
            payment_intent.get("id")
        ),
        "payment_status": (
            payment_intent.get("status")
        ),
        "next_action_url": (
            setup_intent.get(
                "next_action_url"
            )
        ),
    }


@router.post("/create-pro-plan")
async def create_pro_plan():
    plan = await create_plan()

    return {
        "id": plan["id"],
        "name": plan["attributes"]["name"],
        "amount": plan["attributes"]["amount"],
        "currency": plan["attributes"]["currency"],
        "interval": plan["attributes"]["interval"],
    }


@router.post("/mock-checkout")
def mock_checkout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mock_mode = (
        os.getenv("PAYMENT_MOCK_MODE", "false")
        .lower()
        == "true"
    )

    if not mock_mode:
        raise HTTPException(
            status_code=404,
            detail="Not found",
        )

    if (
        current_user.subscription_plan == "pro"
        and current_user.subscription_status == "active"
    ):
        return {
            "success": True,
            "message": "Already subscribed to Pro.",
            "plan": "pro",
        }

    current_user.subscription_plan = "pro"
    current_user.subscription_status = "active"
    current_user.payment_subscription_id = (
        f"mock_sub_{current_user.id}"
    )

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Mock payment successful.",
        "plan": current_user.subscription_plan,
        "status": current_user.subscription_status,
    }