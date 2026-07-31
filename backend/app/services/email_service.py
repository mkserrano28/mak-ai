import os

import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "onboarding@resend.dev",
)


def send_verification_email(
    email: str,
    verification_code: str,
):
    params = {
        "from": f"Mak-AI <{EMAIL_FROM}>",
        "to": [email],
        "subject": "Verify your Mak-AI account",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 520px;
            margin: auto;
            padding: 32px;
        ">
            <h1 style="margin-bottom: 8px;">
                Mak-AI
            </h1>

            <h2>Verify your email</h2>

            <p>
                Welcome to Mak-AI.
            </p>

            <p>
                Enter this verification code to finish
                creating your account:
            </p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 28px 0;
            ">
                {verification_code}
            </div>

            <p>
                This code expires in 10 minutes.
            </p>

            <p style="
                color: #777;
                font-size: 13px;
                margin-top: 32px;
            ">
                If you didn't create a Mak-AI account,
                you can ignore this email.
            </p>
        </div>
        """,
    }

    return resend.Emails.send(params)