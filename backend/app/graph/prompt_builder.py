def prompt_builder_node(state):

    summary = state["memory"].get("summary", "")

    rag = state["context"].get("rag", "")

    research = state["context"].get(
    "research",
    {}
    )

    research_answer = research.get(
        "answer",
        ""
    )

    messages = []

    system_prompt = f"""
You are Mak-AI.

Conversation Summary:

{summary}

Document Context:
{rag}

Web Research:
{research_answer}
"""

    messages.append(
        {
            "role": "system",
            "content": system_prompt,
        }
    )

    for msg in state["messages"]:

        if msg.type == "human":

            role = "user"

        else:

            role = "assistant"

        messages.append(
            {
                "role": role,
                "content": msg.content,
            }
        )

    state["prompt"] = messages

    return state