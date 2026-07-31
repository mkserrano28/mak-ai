import { useChat } from "../../context/ChatContext";

export default function WorkflowPreview() {
  const { workflow } = useChat();

  if (!workflow) {
    return null;
  }

  return (
    <>
      <WorkflowToolbar
        workflow={workflow}
        onDeploy={handleDeploy}
        onExport={handleExport}
        onResetView={handleReset}
      />

      <WorkflowCanvas workflow={workflow} />
    </>
  );
}
