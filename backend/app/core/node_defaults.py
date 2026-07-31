from app.core.node_registry import NODE_REGISTRY


def get_defaults_by_type() -> dict:
    defaults = {}

    for node in NODE_REGISTRY.values():
        defaults[node["type"]] = node.get(
            "defaults",
            {}
        )

    return defaults


def apply_parameter_defaults(workflow: dict) -> dict:
    defaults_by_type = get_defaults_by_type()

    for node in workflow.get("nodes", []):
        node_type = node.get("type")

        parameters = node.get("parameters")

        if not isinstance(parameters, dict):
            parameters = {}

        defaults = defaults_by_type.get(
            node_type,
            {}
        )

        for key, default_value in defaults.items():
            if (
                key not in parameters
                or parameters[key] in (None, "")
            ):
                parameters[key] = default_value

        node["parameters"] = parameters

    return workflow