NODE_REGISTRY = {
    # -------------------------
    # TRIGGERS
    # -------------------------
    "schedule": {
        "label": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "category": "trigger",
        "defaults": {
            "interval": 1,
            "unit": "days",
        },
    },

    "webhook": {
        "label": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "category": "trigger",
        "defaults": {
            "path": "mak-ai-webhook",
            "method": "POST",
        },
    },

    # -------------------------
    # COMMUNICATION
    # -------------------------
    "gmail": {
        "label": "Gmail",
        "type": "n8n-nodes-base.gmail",
        "category": "action",
        "defaults": {
            "to": "{{CONFIGURE_EMAIL}}",
            "subject": "IMAC-AI Notification",
            "message": "{{$json}}",
        },
    },

    "slack": {
        "label": "Slack",
        "type": "n8n-nodes-base.slack",
        "category": "action",
        "defaults": {
            "channel": "{{CONFIGURE_SLACK_CHANNEL}}",
            "message": "{{$json}}",
        },
    },

    # -------------------------
    # DATABASE
    # -------------------------
    "postgres": {
        "label": "PostgreSQL",
        "type": "n8n-nodes-base.postgres",
        "category": "action",
        "defaults": {
            "query": "{{CONFIGURE_SQL_QUERY}}",
        },
    },

    "mysql": {
        "label": "MySQL",
        "type": "n8n-nodes-base.mySql",
        "category": "action",
        "defaults": {
            "query": "{{CONFIGURE_SQL_QUERY}}",
        },
    },

    # -------------------------
    # AI
    # -------------------------
    "agent": {
        "label": "AI Agent",
        "type": "mak-ai.agent",
        "category": "agent",
        "defaults": {
            "role": "AI Assistant",
            "instructions": "",
        },
    },

    "openai": {
        "label": "OpenAI Model",
        "type": "mak-ai.llm",
        "category": "model",
        "defaults": {
            "model": "gpt-4o-mini",
        },
    },

    "memory": {
        "label": "Conversation Memory",
        "type": "mak-ai.memory",
        "category": "memory",
        "defaults": {},
    },


# -------------------------
# MODEL + MEMORY
# -------------------------
"llm": {
    "label": "Chat Model",
    "type": "mak-ai.llm",
    "category": "model",
    "defaults": {
        "provider": "groq",
        "model": "openai/gpt-oss-120b",
    },
},

"conversation_memory": {
    "label": "Conversation Memory",
    "type": "mak-ai.memory",
    "category": "memory",
    "defaults": {
        "sessionKey": "{{SESSION_ID}}",
    },
},
}

def build_node_catalog() -> str:
    lines = []

    for key, node in NODE_REGISTRY.items():
        lines.append(
            f"- {node['label']}: "
            f"{node['type']} "
            f"(category: {node['category']})"
        )

    return "\n".join(lines)