from tavily import TavilyClient
import os

client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)

client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)

print(client.search("latest AI news"))

def search_web(query):
    response = client.search(
        query=query,
        max_results=5
    )

    return response["results"]