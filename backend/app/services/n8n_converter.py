import json



def convert_to_n8n(workflow: dict) -> dict:
    """
    Convert Mak-AI React Flow format into n8n workflow format.
    """

    mak_nodes = workflow.get("nodes", [])
    mak_edges = workflow.get("edges", [])

    n8n_nodes = []
    connections = {}

    # -----------------------------
    # Mak-AI -> n8n node mappings
    # -----------------------------

    NODE_TYPE_MAP = {
        "mak-ai.agent": "@n8n/n8n-nodes-langchain.agent",
        "mak-ai.llm": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
        "mak-ai.memory": "@n8n/n8n-nodes-langchain.memoryBufferWindow",

        "gmail": "n8n-nodes-base.gmail",
        "slack": "n8n-nodes-base.slack",
        "postgres": "n8n-nodes-base.postgres",
        "mysql": "n8n-nodes-base.mySql",
    }

    # Map node IDs to node names
    node_names = {}

    # -----------------------------
    # Convert nodes
    # -----------------------------
    for index, node in enumerate(mak_nodes):
        node_id = str(node["id"])

        name = node.get(
            "label",
            f"Node {index + 1}"
        )

        node_names[node_id] = name

        position = node.get(
            "position",
            {"x": 0, "y": 0}
        )

        # Get Mak-AI node type
        mak_type = node["type"]

        # Convert Mak-AI type -> n8n type
        node_type = NODE_TYPE_MAP.get(
            mak_type,
            mak_type,
        )

        # Copy existing parameters
        parameters = dict(
            node.get("parameters", {})
        )

        # ==========================================
        # 3.1 AI AGENT DEFAULTS
        # ==========================================

        AGENT_TYPES = {
            "mak-ai.agent",
        }

        if mak_type in AGENT_TYPES:

            role = parameters.get("role", name)

            system_message = (
                parameters.get("instructions")
                or f"You are {role}."
            )

            parameters.setdefault(
                "promptType",
                "define",
            )

            parameters.setdefault(
                "text",
                "={{ $json.chatInput || $json.message || $json.text }}",
            )

            parameters.setdefault(
                "options",
                {
                    "systemMessage": system_message,
                },
            )

        # ==========================================
        # 3.2 AI MODEL DEFAULTS
        # ADD HERE
        # ==========================================

        if mak_type == "mak-ai.llm":
            # Generator currently uses "model",
            # while the converter previously expected "modelName".
            model = parameters.pop(
                "model",
                parameters.get("modelName", "gpt-4o-mini"),
            )

            parameters["modelName"] = model

            parameters.setdefault(
                "options",
                {},
            )

            parameters.setdefault(
                "modelName",
                "gpt-4o-mini",
            )

            parameters.setdefault(
                "options",
                {},
            )


        # ==========================================
        # 3.3 MEMORY DEFAULTS
        # ADD HERE
        # ==========================================

        if mak_type == "mak-ai.memory":

            parameters.setdefault(
                "sessionKey",
                "={{ $json.sessionId || 'mak-ai-session' }}",
            )

            parameters.setdefault(
                "contextWindowLength",
                10,
            )

        # ==========================================
        # CREATE N8N NODE
        # ==========================================

        n8n_node = {
            "id": node_id,
            "name": name,
            "type": node_type,
            "typeVersion": 1,
            "position": [
                position.get("x", 0),
                position.get("y", 0),
            ],
            "parameters": parameters,
        }

        n8n_nodes.append(n8n_node)

    # -----------------------------
    # Convert edges / connections
    # -----------------------------
    for edge in mak_edges:
        source_id = str(edge["source"])
        target_id = str(edge["target"])

        source_name = node_names.get(source_id)
        target_name = node_names.get(target_id)

        if not source_name or not target_name:
            continue

        connection_type = edge.get(
            "connectionType",
            "main",
        )

        # -----------------------------------------
        # Normalize AI connection direction for n8n
        # -----------------------------------------

        reverse_connection_types = {
            "ai_tool",
            "ai_languageModel",
            "ai_memory",
        }

        if connection_type in reverse_connection_types:
            source_name, target_name = (
                target_name,
                source_name,
            )

        # Supported Mak-AI connection types
        allowed_connection_types = {
            "main",
            "ai_agent",
            "ai_tool",
            "ai_languageModel",
            "ai_memory",
        }

        if connection_type not in allowed_connection_types:
            connection_type = "main"

        # Create source connection container
        if source_name not in connections:
            connections[source_name] = {}

        # Create connection type
        if connection_type not in connections[source_name]:
            connections[source_name][connection_type] = [[]]

        # Add target
        connections[source_name][connection_type][0].append({
            "node": target_name,
            "type": connection_type,
            "index": 0,
        })
    print("\n==============================")
    print("CONVERTED N8N WORKFLOW")
    print("==============================")

    print(
        json.dumps(
            {
                "nodes": n8n_nodes,
                "connections": connections,
            },
            indent=2,
        )
    )
    return {
    "nodes": n8n_nodes,
    "connections": connections,
    }