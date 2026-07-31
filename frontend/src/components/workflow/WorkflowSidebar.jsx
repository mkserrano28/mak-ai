import { useState, useEffect } from "react";

export default function WorkflowSidebar({ node, onClose, onSave }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(node?.data?.parameters?.query || "");
  }, [node]);

  if (!node) return null;

  return (
    <aside className="workflow-sidebar">
      <h2>{node.data.label}</h2>

      <p>{node.data.type}</p>

      {node.data.parameters?.query && (
        <>
          <label>SQL Query</label>

          <textarea value={query} onChange={(e) => setQuery(e.target.value)} />
        </>
      )}

      <button
        onClick={() => {
          onSave({
            query,
          });
        }}
      >
        Save
      </button>

      <button onClick={onClose}>Close</button>
    </aside>
  );
}
