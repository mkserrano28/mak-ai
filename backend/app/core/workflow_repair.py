import copy

def repair_workflow(workflow: dict) -> dict:
    nodes = workflow["nodes"]
    edges = workflow["edges"]

    next_id = max(int(n["id"]) for n in nodes) + 1

    agent_types = {
        "mak-ai.agent",
    }

    for agent in list(nodes):

        if agent["type"] not in agent_types:
            continue

        role = agent.get("parameters", {}).get("role", "")

        # Only the Orchestrator gets default model & memory
        if role != "Orchestrator":
            continue

        agent_id = agent["id"]

        has_model = any(
            e["target"] == agent_id
            and e["connectionType"] == "ai_languageModel"
            for e in edges
        )

        has_memory = any(
            e["target"] == agent_id
            and e["connectionType"] == "ai_memory"
            for e in edges
        )
    return workflow