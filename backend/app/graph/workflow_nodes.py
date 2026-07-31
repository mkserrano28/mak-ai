from langchain_core.messages import AIMessage

from app.services.workflow_generator import generate_ai_workflow


async def workflow_planner_node(state):
    print(">>> Workflow Planner")

    user_request = state["messages"][-1].content

    try:
        # Generate advanced Mak-AI workflow
        workflow = await generate_ai_workflow(
            user_request
        )

        workflow_data = workflow.model_dump()

        print("\n================================")
        print("GENERATED MAK-AI WORKFLOW")
        print("================================")
        print(workflow_data)

        # Store workflow for frontend
        state["workflow"] = workflow_data
        state["workflow_preview"] = workflow_data

        state["response"] = "📋 Workflow Preview"

        state["messages"].append(
            AIMessage(
                content=state["response"]
            )
        )

        return state

    except Exception as error:
        print(
            "WORKFLOW PLANNER ERROR:",
            error,
        )

        state["response"] = (
            f"Failed to generate workflow: {error}"
        )

        state["messages"].append(
            AIMessage(
                content=state["response"]
            )
        )

        return state