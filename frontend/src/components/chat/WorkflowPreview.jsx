import WorkflowCanvas from "../workflow/WorkflowCanvas";

export default function WorkflowPreview({ workflow }) {
  return (
    <div className="workflow-preview">
      <WorkflowCanvas workflow={workflow} />
    </div>
  );
}
