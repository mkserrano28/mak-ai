from app.services.llm import generate_response


def choose_route(user_message: str):

    prompt = f"""
You are Mak-AI's routing agent.

Available routes:

chat
rag

Return ONLY one word.

User:
{user_message}
"""

    route = generate_response(
        [
            {
                "role": "system",
                "content": prompt,
            }
        ]
    )

    return route.strip().lower()