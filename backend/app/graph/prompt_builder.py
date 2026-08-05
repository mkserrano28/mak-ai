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
    research_results = research.get("results", [])

    research_context = ""

    for item in research_results[:5]:
        research_context += f"""
    Title: {item.get("title", "")}
    Source: {item.get("url", "")}

    {item.get("content", "")}

"""

    messages = []

    route = state["route"]

    if route == "rag":
        system_prompt = f"""
    You are Mak-AI.

    Conversation Summary:

    {summary}

    Document Context:

    {rag}
    """

    elif route == "research":
        system_prompt = f"""
    You are Mak-AI.

    Use the WEB RESEARCH below as the primary source of truth.

    Do NOT answer from your own training knowledge if the web research contains the answer.

    If the web research includes recent information,
    never mention your knowledge cutoff.

    Answer using ONLY the information below.

    ========================
    WEB RESEARCH
    ========================

    {research_context}

    ========================
    END WEB RESEARCH
    ========================
    """

    else:
        system_prompt = f"""
    You are Mak-AI.

    Conversation Summary:

    {summary}
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