
from app.automation.builders.postgres_builder import build_postgres_node
from app.automation.builders.gmail_builder import build_gmail_node

NODE_BUILDERS = {
    "postgres": build_postgres_node,
    "gmail": build_gmail_node,
}