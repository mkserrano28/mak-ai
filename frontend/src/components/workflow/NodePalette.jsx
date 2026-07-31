import { useState } from "react";

export default function NodePalette({ onSelectNode }) {
  const [search, setSearch] = useState("");
  const sections = [
    {
      title: "⚡ Trigger",
      items: [
        { label: "Schedule Trigger", type: "schedule" },
        { label: "Webhook", type: "webhook" },
      ],
    },

    {
      title: "🗄 Database",
      items: [
        {
          icon: "🐘",
          label: "PostgreSQL",
          type: "postgres",
          description: "Execute SQL queries",
        },
        { label: "MySQL", type: "mysql" },
        { label: "MongoDB", type: "mongodb" },
      ],
    },

    {
      title: "🤖 AI",
      items: [
        { label: "AI Agent", type: "agent" },
        { label: "OpenAI", type: "openai" },
      ],
    },

    {
      title: "📨 Communication",
      items: [
        {
          icon: "💬",
          label: "Slack",
          type: "slack",
          description: "Send Slack messages",
        },
        { label: "Gmail", type: "gmail" },
      ],
    },
  ];
  return (
    <div
      className="node-palette"
      style={{
        position: "absolute",
        top: "70px",
        left: "20px",
        width: "280px",
        background: "#111827",
        color: "white",
        padding: "16px",
        borderRadius: "12px",
        zIndex: 9999,
      }}
    >
      <h3>Node Palette</h3>
      <input
        type="text"
        placeholder="Search nodes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="node-search"
      />
      {sections.map((section) => {
        const filteredItems = section.items.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        );

        if (filteredItems.length === 0) return null;

        return (
          <div key={section.title} style={{ marginBottom: "18px" }}>
            <h4>{section.title}</h4>

            {filteredItems.map((item) => (
              <div
                className="node-card"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/reactflow",
                    JSON.stringify(item),
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <div className="node-card-icon">{item.icon}</div>

                <div className="node-card-content">
                  <h5>{item.label}</h5>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {sections.every((section) =>
        section.items.every(
          (item) => !item.label.toLowerCase().includes(search.toLowerCase()),
        ),
      ) && <p>No nodes found.</p>}
    </div>
  );
}
