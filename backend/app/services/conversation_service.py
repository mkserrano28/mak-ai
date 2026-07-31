from app.database import models
from app.services.rag_services import build_context, build_sources
from app.graph.graph import graph
from langchain_core.messages import HumanMessage, AIMessage



MAX_TITLE_LENGTH = 40
MAX_HISTORY_MESSAGES = 12


def update_chat_title(chat, user_text):
    """
    Rename only chats still titled 'New Chat'
    """

    if not chat:
        return

    if chat.title != "New Chat":
        return

    title = user_text.strip()

    if len(title) > MAX_TITLE_LENGTH:
        title = title[:MAX_TITLE_LENGTH] + "..."

    chat.title = title


def save_user_message(db, chat_id, role, content):

    message = models.Message(
        chat_id=chat_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()

    return message


def save_ai_message(db, chat_id, content):

    message = models.Message(
        chat_id=chat_id,
        role="assistant",
        content=content,
    )

    db.add(message)
    db.commit()

    return message

async def process_chat(request, db):
    
    context, sources, results = build_context(
        request.messages[-1].content,
        document_ids=request.document_ids,
    )
    has_context = bool(context.strip())

    if has_context:

        messages = [
            {
                "role": "system",
                "content": f"""
    You are Mak-AI.

    The user may upload multiple documents.

    If DOCUMENT CONTEXT is provided,
    answer using the document context whenever it is relevant.

    If the user's question is unrelated to the uploaded documents,
    answer it normally.

    ========================
    DOCUMENT CONTEXT
    ========================

    {context}

    ========================
    END OF DOCUMENT CONTEXT
    ========================
    """
            }
        ]

    else:

        messages = [
            {
                "role": "system",
                "content": """
    You are Mak-AI, a helpful AI assistant.

    Answer naturally and conversationally.

    If the user later uploads documents,
    you may use them to answer questions.
    """
            }
        ]



    messages.extend(
        [message.model_dump() for message in request.messages]
    )

    # Latest user message
    user_message = request.messages[-1]

    recent_messages = request.messages[
        -MAX_HISTORY_MESSAGES:
    ]

    # Get the chat
    chat = (
        db.query(models.Chat)
        .filter(models.Chat.id == request.chat_id)
        .first()
    )

    # Rename only if this is still a new chat
    update_chat_title(
        chat,
        user_message.content,
    )

    db.commit()

    # Save the user's message
    save_user_message(
        db,
        request.chat_id,
        user_message.role,
        user_message.content,
    )

    # Build LangGraph input
    graph_input = {
        "messages": [
            HumanMessage(content=msg.content)
            if msg.role == "user"
            else AIMessage(content=msg.content)
            for msg in recent_messages
        ],
        "user_id": str(request.chat_id),
        "workspace_id": str(chat.workspace_id),
        "memory": {},
        "context": {
            "document_context": context,
        },
        "metadata": {},
        "route": "",
        "prompt": [],
        "response": "",
        "workflow": None,
        "workflow_preview": None,
        "research": None,
        "sources": sources,
    }

    # Run LangGraph asynchronously
    result = await graph.ainvoke(graph_input)

    reply = result.get("response", "")

    save_ai_message(
        db,
        request.chat_id,
        reply,
    )

    db.commit()
    print("=== GRAPH RESULT ===")
    print(result)
    print("====================")
    # Workflow Preview
    if result.get("workflow_preview"):

        return {
            "type": "workflow_preview",
            "response": reply,
            "workflow_preview": result["workflow_preview"],
            "sources": result.get("sources", []),
        }

    # Research
    elif result.get("research"):

        return {
            "type": "research",
            "results": result["research"],
        }
    


    # Normal chat
    return {
        "type": "text",
        "response": reply,
        "sources": result.get("sources", []),
    }