from app.tools.tavily import web_search

results = web_search(
    "Latest LangGraph updates"
)

print(results)