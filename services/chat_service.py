from services.groq_service import client

def get_model_name(
    has_image
):

    if has_image:
        return (
            "meta-llama/"
            "llama-4-scout-17b-16e-instruct"
        )

    return "llama-3.3-70b-versatile"
def create_chat_completion(
    messages_payload,
    model_name
):

    return client.chat.completions.create(
        model=model_name,
        messages=messages_payload,
        max_tokens=1024,
        temperature=0.7,
        stream=True
    )
def build_messages_payload(
    history,
    prompt,
    context=None
):

    messages_payload = []

    for m in history:

        if m["role"] == "user":

            messages_payload.append({
                "role": "user",
                "content": m["content"]
            })

        else:

            messages_payload.append({
                "role": "assistant",
                "content": m["content"]
            })

    if context:

        messages_payload.insert(
            0,
            {
                "role": "system",
                "content": f"""
    You are Mak-AI, a helpful AI assistant.

    The context may contain:
    - PDF document information
    - Internet search results
    - Retrieved knowledge

    Instructions:
    - If web search results are present, prioritize them over general knowledge.
    - Answer using the latest information from the search results.
    - Summarize the most important developments.
    - Do not give generic background information unless requested.
    - Do not copy search results verbatim.
    - Mention sources at the end.

    Context:

    {context}
    """
            }
        )

    messages_payload.append({
        "role": "user",
        "content": prompt
    })

    return messages_payload