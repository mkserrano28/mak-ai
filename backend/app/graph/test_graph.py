from langchain_core.messages import HumanMessage


from .graph import graph

state = {
    "messages": [
        HumanMessage(content="Summarize my uploaded PDF")
    ],

    "user_id": "123",
    "workspace_id": "456",

    "memory": {
        "summary": "",
        "preferences": {},
        "profile": {},
    },

    "context": {
        "rag": "",
        "documents": [],
        "sources": [],
    },

    "metadata": {},

    "route": "",

    "response": "",
}
result = graph.invoke(state)

print(result)