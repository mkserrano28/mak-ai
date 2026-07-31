import base64
import os

import httpx
from fastapi import HTTPException


PAYMONGO_SECRET_KEY = os.getenv(
    "PAYMONGO_SECRET_KEY"
)

PAYMONGO_BASE_URL = (
    "https://api.paymongo.com/v1"
)


def _headers():
    if not PAYMONGO_SECRET_KEY:
        raise RuntimeError(
            "PAYMONGO_SECRET_KEY is not configured"
        )

    token = base64.b64encode(
        f"{PAYMONGO_SECRET_KEY}:".encode()
    ).decode()

    return {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json",
    }


async def _request(
    method: str,
    endpoint: str,
    payload=None,
):
    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:
        response = await client.request(
            method,
            f"{PAYMONGO_BASE_URL}{endpoint}",
            headers=_headers(),
            json=payload,
        )

    if not response.is_success:
        print(
            "PayMongo error:",
            response.status_code,
            response.text,
        )

        raise HTTPException(
            status_code=502,
            detail="PayMongo request failed",
        )

    return response.json()


async def create_customer(
    name: str,
    email: str,
):
    # Split the Mak-AI user's name for PayMongo.
    parts = name.strip().split(
        maxsplit=1
    )

    first_name = parts[0]

    last_name = (
        parts[1]
        if len(parts) > 1
        else "-"
    )

    payload = {
        "data": {
            "attributes": {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
            }
        }
    }

    result = await _request(
        "POST",
        "/customers",
        payload,
    )

    return result["data"]


async def create_subscription(
    customer_id: str,
    plan_id: str,
):
    payload = {
        "data": {
            "attributes": {
                "customer_id": customer_id,
                "plan_id": plan_id,
            }
        }
    }

    result = await _request(
        "POST",
        "/subscriptions",
        payload,
    )

    return result["data"]


async def create_plan():
    payload = {
        "data": {
            "attributes": {
                "name": "Mak-AI Pro",
                "description": (
                    "Mak-AI Pro monthly subscription"
                ),
                "type": "scheduled",
                "amount": 49900,
                "currency": "PHP",
                "interval": "monthly",
                "interval_count": 1,
                "metadata": {
                    "product": "mak-ai",
                    "plan": "pro",
                },
            }
        }
    }

    result = await _request(
        "POST",
        "/subscriptions/plans",
        payload,
    )

    return result["data"]