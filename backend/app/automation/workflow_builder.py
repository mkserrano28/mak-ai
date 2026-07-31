from app.automation.workflow_models import WorkflowPlan


class WorkflowManager:

    def __init__(self):
        self.pending = {}

    def create(self, workflow: WorkflowPlan):

        workflow_id = len(self.pending) + 1

        self.pending[workflow_id] = workflow

        return workflow_id

    def get(self, workflow_id):

        return self.pending.get(workflow_id)

    def approve(self, workflow_id):

        workflow = self.pending.pop(workflow_id)

        return workflow