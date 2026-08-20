import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv(
    "MODEL_NAME",
    "openai/gpt-oss-120b"
)


MAX_MESSAGES = 12
MAX_CHARS_PER_MESSAGE = 12000
MAX_TOTAL_CHARS = 30000


def trim_messages(messages: list) -> list:
    if not messages:
        return []

    system_messages = [
        message
        for message in messages
        if message.get("role") == "system"
    ]

    conversation_messages = [
        message
        for message in messages
        if message.get("role") != "system"
    ]

    conversation_messages = conversation_messages[
        -MAX_MESSAGES:
    ]

    trimmed = []

    # Keep the latest system prompt only.
    if system_messages:
        system_message = system_messages[-1].copy()

        content = str(
            system_message.get("content", "")
        )

        system_message["content"] = content[
            :MAX_CHARS_PER_MESSAGE
        ]

        trimmed.append(system_message)

    for message in conversation_messages:
        item = message.copy()

        content = str(
            item.get("content", "")
        )

        item["content"] = content[
            :MAX_CHARS_PER_MESSAGE
        ]

        trimmed.append(item)

    # Hard total-size protection.
    total_chars = 0
    final_messages = []

    for message in reversed(trimmed):
        content = str(
            message.get("content", "")
        )

        remaining = (
            MAX_TOTAL_CHARS - total_chars
        )

        if remaining <= 0:
            break

        if len(content) > remaining:
            message = message.copy()
            message["content"] = content[-remaining:]

        final_messages.append(message)

        total_chars += len(
            message.get("content", "")
        )

    return list(reversed(final_messages))


def generate_response(messages: list) -> str:
    safe_messages = trim_messages(messages)

    print("=" * 60)
    print(
        f"Messages sent to Groq: "
        f"{len(safe_messages)}"
    )

    print(
        f"Approx chars: "
        f"{sum(len(str(m.get('content', ''))) for m in safe_messages)}"
    )
    print("=" * 60)

    response = client.chat.completions.create(
        model=MODEL,
        messages=safe_messages,
        temperature=0.7,
        stream=False,
    )

    return response.choices[0].message.content