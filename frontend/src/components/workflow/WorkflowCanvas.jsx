import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import WorkflowNode from "./WorkflowNode";
import { useState, useRef, useEffect } from "react";
import WorkflowSidebar from "./WorkflowSidebar";
import WorkflowToolbar from "./WorkflowToolbar";
import WorkflowLibrary from "./WorkflowLibrary";
import { apiFetch } from "../../services/api";
import PricingModal from "../subscription/PricingModal";

import {
  getSubscription,
  mockUpgradeToPro,
} from "../../services/subscriptionApi";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

// ----------------------
// Convert n8n nodes
// ----------------------
function buildNodes(workflow) {
  if (!workflow) {
    return [];
  }

  // Support both:
  // { nodes, edges }
  // and { workflow: { nodes, edges } }
  const workflowData = workflow.workflow ?? workflow;

  if (!Array.isArray(workflowData.nodes)) {
    console.warn("Workflow has no nodes:", workflowData);
    return [];
  }

  return workflowData.nodes.map((node) => {
    // New Mak-AI format:
    // position: { x: 100, y: 200 }
    //
    // Old n8n format:
    // position: [100, 200]

    let position = {
      x: 0,
      y: 0,
    };

    if (Array.isArray(node.position)) {
      position = {
        x: node.position[0] ?? 0,
        y: node.position[1] ?? 0,
      };
    } else if (node.position) {
      position = {
        x: node.position.x ?? 0,
        y: node.position.y ?? 0,
      };
    }

    return {
      id: String(node.id),

      type: "workflowNode",

      position,

      data: {
        // New format uses label.
        // Old n8n format uses name.
        label: node.label ?? node.name ?? "Node",

        type: node.type,

        category: node.category ?? "action",

        parameters: node.parameters ?? {},
      },
    };
  });
}

// ----------------------
// Convert n8n connections
// ----------------------
function buildEdges(workflow) {
  if (!workflow) {
    return [];
  }

  const workflowData = workflow.workflow ?? workflow;

  // --------------------------------
  // NEW MAK-AI FORMAT
  // --------------------------------

  if (Array.isArray(workflowData.edges)) {
    return workflowData.edges.map((edge, index) => ({
      id: edge.id ?? `edge-${edge.source}-${edge.target}-${index}`,

      source: String(edge.source),
      target: String(edge.target),

      connectionType: edge.connectionType ?? "main",

      sourceHandle: edge.sourceHandle ?? undefined,

      targetHandle: edge.targetHandle ?? undefined,

      animated: true,
      type: "smoothstep",
    }));
  }

  // --------------------------------
  // OLD N8N FORMAT
  // --------------------------------

  const edges = [];
  const nodeLookup = {};

  if (!Array.isArray(workflowData.nodes)) {
    return [];
  }

  workflowData.nodes.forEach((node) => {
    nodeLookup[node.name] = String(node.id);
  });

  Object.entries(workflowData.connections ?? {}).forEach(
    ([sourceName, outputs]) => {
      outputs.main?.forEach((outputGroup) => {
        outputGroup.forEach((connection) => {
          const source = nodeLookup[sourceName];

          const target = nodeLookup[connection.node];

          if (!source || !target) {
            return;
          }

          edges.push({
            id: `${source}-${target}`,

            source,
            target,

            connectionType: "main",

            animated: true,
            type: "smoothstep",
          });
        });
      });
    },
  );

  return edges;
}

// ----------------------
// Component
// ----------------------
export default function WorkflowCanvas({ workflow }) {
  const [workflows, setWorkflows] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  // <-- THIS IS WHERE THESE GO
  const initialNodes = buildNodes(workflow);
  const initialEdges = buildEdges(workflow);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (!workflow) return;

    console.log("✅ CHAT PREVIEW WORKFLOW");

    const newNodes = buildNodes(workflow);
    const newEdges = buildEdges(workflow);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow]);

  const handleAddNode = (type) => {
    const nodeTemplates = {
      schedule: {
        label: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
      },

      postgres: {
        label: "PostgreSQL",
        type: "n8n-nodes-base.postgres",
      },

      mysql: {
        label: "MySQL",
        type: "n8n-nodes-base.mySql",
      },

      mongodb: {
        label: "MongoDB",
        type: "n8n-nodes-base.mongoDb",
      },

      webhook: {
        label: "Webhook",
        type: "n8n-nodes-base.webhook",
      },

      gmail: {
        label: "Gmail",
        type: "n8n-nodes-base.gmail",
        parameters: {
          operation: "send",
          to: "{{CONFIGURE_EMAIL}}",
          subject: "Mak-AI Notification",
          message: "{{$json}}",
        },
      },

      slack: {
        label: "Slack",
        type: "n8n-nodes-base.slack",
      },

      agent: {
        label: "AI Agent",
        type: "mak-ai.agent",
      },

      llm: {
        label: "AI Model",
        type: "mak-ai.llm",
      },
    };

    const template = nodeTemplates[type];

    const newNode = {
      id: crypto.randomUUID(),

      type: "workflowNode",

      position: {
        x: 300,

        y: 200,
      },

      data: {
        ...template,
        parameters: template.parameters || {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id,
      ),
    );

    setSelectedNode(null);
  };
  const handleDuplicateNode = () => {
    if (!selectedNode) return;

    const duplicatedNode = {
      ...selectedNode,
      id: crypto.randomUUID(),
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 40,
      },
      data: {
        ...selectedNode.data,
        parameters: {
          ...selectedNode.data.parameters,
        },
      },
    };

    setNodes((nds) => [...nds, duplicatedNode]);
  };
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  const onDrop = (event) => {
    event.preventDefault();

    const data = JSON.parse(
      event.dataTransfer.getData("application/reactflow"),
    );

    const position = reactFlowInstance.current.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: crypto.randomUUID(),
      type: "workflowNode",
      position,
      data: {
        label: data.label,
        type: data.type,
        parameters: {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };
  const onConnect = (connection) => {
    console.log("Connected:", connection);

    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          animated: true,
          type: "smoothstep",
        },
        eds,
      ),
    );
  };
  function handleSaveNode(updatedParameters) {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== selectedNode.id) return node;

        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            parameters: {
              ...node.data.parameters,
              ...updatedParameters,
            },
          },
        };

        // Keep the sidebar in sync
        setSelectedNode(updatedNode);

        return updatedNode;
      }),
    );
  }
  const onConnectStart = (_, params) => {
    console.log("CONNECT START", params);
  };

  const onConnectEnd = () => {
    console.log("CONNECT END");
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = document.activeElement?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }

      if (event.key === "Delete" && selectedNode) {
        handleDeleteNode();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();

        if (selectedNode) {
          handleDuplicateNode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNode]);

  const handleExportWorkflow = () => {
    const workflow = {
      nodes: nodes.map((node) => ({
        id: node.id,

        label: node.data.label,

        type: node.data.type,

        position: node.position,

        parameters: node.data.parameters,
      })),

      edges: edges.map((edge) => ({
        source: edge.source,

        target: edge.target,
      })),
    };

    const json = JSON.stringify(workflow, null, 2);

    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "workflow.json";

    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImportWorkflow = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const workflow = JSON.parse(e.target.result);

      const importedNodes = workflow.nodes.map((node) => ({
        id: node.id,
        type: "workflowNode",
        position: node.position,
        data: {
          label: node.label,
          type: node.type,
          parameters: node.parameters || {},
        },
      }));

      const importedEdges = workflow.edges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        animated: true,
        type: "smoothstep",
      }));

      setNodes(importedNodes);
      setEdges(importedEdges);
    };

    reader.readAsText(file);
  };
  const fileInputRef = useRef(null);

  const handleSaveWorkflow = async () => {
    const workflow = {
      name: workflowName,

      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
        category: node.data.category || "action",
        position: node.position,
        parameters: node.data.parameters || {},
      })),

      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        connectionType: edge.connectionType || "main",
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
      })),
    };

    try {
      // UPDATE EXISTING WORKFLOW
      if (currentWorkflowId) {
        const response = await apiFetch(`/api/workflows/${currentWorkflowId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workflow),
        });

        if (!response.ok) {
          throw new Error("Failed to update workflow");
        }
      }

      // CREATE NEW WORKFLOW
      else {
        const response = await apiFetch("/api/workflows/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workflow),
        });

        const data = await response.json();

        if (!response.ok) {
          const detail = data?.detail;

          if (
            response.status === 403 &&
            detail?.code === "PLAN_LIMIT_REACHED"
          ) {
            try {
              const currentSubscription = await getSubscription();

              setSubscription(currentSubscription);
            } catch (error) {
              console.error("Failed to load subscription:", error);
            }

            setShowPricing(true);

            return;
          }

          throw new Error(
            typeof detail === "string"
              ? detail
              : detail?.message || "Failed to save workflow",
          );
        }

        setCurrentWorkflowId(data.id);

        localStorage.setItem("lastWorkflow", data.id);
      }

      await fetchWorkflows();

      alert("Workflow saved!");
    } catch (error) {
      console.error("Save workflow error:", error);

      alert(error.message || "Failed to save workflow.");
    }
  };

  const handleDeployWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add at least one node before deploying.");
      return;
    }
    const handleUpgrade = async () => {
      try {
        setUpgrading(true);

        await mockUpgradeToPro();

        const updated = await getSubscription();

        setSubscription(updated);
        setShowPricing(false);

        alert("Welcome to Mak-AI Pro!");
      } catch (error) {
        console.error("Upgrade failed:", error);

        alert(error.message || "Unable to upgrade.");
      } finally {
        setUpgrading(false);
      }
    };

    const payload = {
      workflow_id: currentWorkflowId,

      name: workflowName, // <-- ADD THIS

      workflow: {
        nodes: nodes.map((node) => ({
          id: node.id,
          label: node.data.label,
          type: node.data.type,

          category: node.data.category || "action",

          position: node.position,
          parameters: node.data.parameters || {},
        })),

        edges: edges.map((edge) => ({
          source: edge.source,
          target: edge.target,

          connectionType: edge.connectionType || "main",

          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
        })),
      },
    };

    try {
      const response = await apiFetch("/api/workflows/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Deploy error:", result);

        const detail = result?.detail;

        if (response.status === 403 && detail?.code === "PRO_REQUIRED") {
          try {
            const currentSubscription = await getSubscription();

            setSubscription(currentSubscription);
          } catch (error) {
            console.error("Failed to load subscription:", error);
          }

          setShowPricing(true);
          return;
        }

        alert(
          typeof detail === "string"
            ? detail
            : detail?.message || "Failed to deploy workflow.",
        );

        return;
      }

      console.log("n8n deployment:", result);

      alert("Workflow deployed to n8n!");
    } catch (error) {
      console.error("Deploy error:", error);

      alert("Unable to connect to deployment API.");
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!aiPrompt.trim()) {
      alert("Enter a workflow prompt first.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await apiFetch("/api/ai/generate-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
        }),
      });

      const generated = await response.json();

      if (!response.ok) {
        throw new Error(generated.detail || "Failed to generate workflow");
      }

      // Convert API nodes into React Flow nodes
      const generatedNodes = generated.nodes.map((node) => ({
        id: String(node.id),
        type: "workflowNode",
        position: node.position,

        data: {
          label: node.label,
          type: node.type,
          category: node.category || "action",
          parameters: node.parameters || {},
        },
      }));

      // Convert API edges into React Flow edges
      const generatedEdges = generated.edges.map((edge, index) => ({
        id: `ai-edge-${index}`,
        source: String(edge.source),
        target: String(edge.target),

        connectionType: edge.connectionType || "main",

        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,

        animated: true,
        type: "smoothstep",
      }));

      setNodes(generatedNodes);
      setEdges(generatedEdges);

      // AI generation is a new unsaved workflow
      setCurrentWorkflowId(null);
      localStorage.removeItem("lastWorkflow");
    } catch (error) {
      console.error("AI workflow generation failed:", error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await apiFetch("/api/workflows/");

      if (!response.ok) {
        throw new Error("Failed to load workflows");
      }

      const data = await response.json();

      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch workflows error:", error);

      setWorkflows([]);
    }
  };
  useEffect(() => {
    fetchWorkflows();

    const lastWorkflow = localStorage.getItem("lastWorkflow");

    if (lastWorkflow) {
      loadWorkflow(lastWorkflow);
    }
  }, []);

  const loadWorkflow = async (workflowId) => {
    try {
      console.log("🚨 LOADING SAVED WORKFLOW", workflowId);

      const response = await apiFetch(`/api/workflows/${workflowId}`);

      if (response.status === 404) {
        console.warn(`Workflow ${workflowId} no longer exists`);

        localStorage.removeItem("lastWorkflow");
        setCurrentWorkflowId(null);

        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load workflow");
      }

      const saved = await response.json();

      console.log("🚨 SAVED WORKFLOW", saved);

      setWorkflowName(saved.name || "Untitled Workflow");

      const importedNodes = saved.workflow.nodes.map((node) => ({
        id: node.id,
        type: "workflowNode",
        position: node.position,

        data: {
          label: node.label,
          type: node.type,

          // Advanced workflow support
          category: node.category || "action",

          parameters: node.parameters || {},
        },
      }));

      const importedEdges = saved.workflow.edges.map((edge, index) => ({
        id: edge.id || `edge-${index}`,

        source: edge.source,
        target: edge.target,

        // Advanced workflow support
        connectionType: edge.connectionType || "main",

        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,

        animated: true,
        type: "smoothstep",
      }));

      setNodes(importedNodes);
      setEdges(importedEdges);
      setCurrentWorkflowId(workflowId);
      localStorage.setItem("lastWorkflow", workflowId);
    } catch (error) {
      console.error(error);
    }
  };
  const deleteWorkflow = async (workflowId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workflow?",
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workflow");
      }

      // If we're deleting the currently opened workflow
      if (String(currentWorkflowId) === String(workflowId)) {
        setCurrentWorkflowId(null);
        localStorage.removeItem("lastWorkflow");
      }
      // Refresh workflow library
      await fetchWorkflows();
    } catch (error) {
      console.error("Delete workflow error:", error);
      alert("Failed to delete workflow.");
    }
  };
  const handleNewWorkflow = () => {
    const confirmed = window.confirm(
      "Create a new workflow? Unsaved changes will be lost.",
    );

    if (!confirmed) return;

    // Clear canvas
    setNodes([]);
    setEdges([]);

    // Nothing selected
    setSelectedNode(null);

    // Important: next Save must POST, not PUT
    setCurrentWorkflowId(null);
    setWorkflowName("Untitled Workflow");

    // Don't reload the old workflow after refresh
    localStorage.removeItem("lastWorkflow");
  };
  return (
    <ReactFlowProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100vh",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            minWidth: 0,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImportWorkflow}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={(event, node) => setSelectedNode(node)}
            fitView
          >
            <Background gap={24} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              bgColor="#111827"
              maskColor="rgba(17,24,39,.75)"
              nodeColor="#4f46e5"
              style={{
                width: 100,
                height: 70,
              }}
            />
          </ReactFlow>

          <WorkflowSidebar
            node={selectedNode}
            onSave={handleSaveNode}
            onClose={() => setSelectedNode(null)}
          />

          <WorkflowToolbar
            workflows={workflows}
            loadWorkflow={loadWorkflow}
            deleteWorkflow={deleteWorkflow}
            onNewWorkflow={handleNewWorkflow}
            workflowName={workflowName}
            setWorkflowName={setWorkflowName}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onExport={handleExportWorkflow}
            onImport={() => fileInputRef.current.click()}
            onSave={handleSaveWorkflow}
            onDeploy={handleDeployWorkflow}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isGenerating={isGenerating}
            onGenerateWorkflow={handleGenerateWorkflow}
          />
          {showPricing && (
            <PricingModal
              subscription={subscription}
              onClose={() => setShowPricing(false)}
              onUpgrade={handleUpgrade}
              upgrading={upgrading}
            />
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
