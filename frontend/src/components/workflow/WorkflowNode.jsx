import { Handle, Position } from "@xyflow/react";
import "./workflow.css";

const icons = {
  "n8n-nodes-base.scheduleTrigger": "🕒",
  "n8n-nodes-base.postgres": "🐘",
  "n8n-nodes-base.httpRequest": "🌐",
  "n8n-nodes-base.slack": "💬",
  "n8n-nodes-base.gmail": "📧",
};

export default function WorkflowNode({ data, isConnectable }) {
  const icon = icons[data.type] || "⚙️";
  console.log("Rendering node:", data.label, data.type);
  return (
    <div className="workflow-node">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 14,
          height: 14,
          background: "#22c55e",
        }}
      />

      <div className="workflow-node-header">
        <span className="workflow-icon">{icon}</span>

        <div>
          <strong>{data.parameters?.role || data.label}</strong>

          <div className="workflow-node-type">
            {data.type.replace("n8n-nodes-base.", "")}
          </div>
        </div>
      </div>

      {data.parameters?.query && (
        <pre className="workflow-query">{data.parameters.query}</pre>
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 14,
          height: 14,
          background: "#22c55e",
        }}
      />
    </div>
  );
}
