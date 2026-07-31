from tavily import TavilyClient

from app.core.config import settings

client = TavilyClient(
    api_key=settings.TAVILY_API_KEY
)


def web_search(
    query: str,
    max_results: int = 5,
):
    """
    Perform an AI-optimized web search.
    """

    return client.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
        include_answer=True,
        include_raw_content=False,
    )