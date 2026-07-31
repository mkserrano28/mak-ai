import { createContext, useContext, useEffect, useState } from "react";

import {
  getWorkspaces,
  createWorkspace as apiCreateWorkspace,
  renameWorkspace as apiRenameWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
} from "../services/workspaceApi";

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("makai_access_token");

    if (!token) {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      return;
    }

    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    const token = localStorage.getItem("makai_access_token");

    if (!token) {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      return;
    }

    try {
      const data = await getWorkspaces();

      setWorkspaces(data);

      if (data.length > 0) {
        setCurrentWorkspaceId((current) => {
          const stillExists = data.some(
            (workspace) => workspace.id === current,
          );

          return stillExists ? current : data[0].id;
        });
      } else {
        setCurrentWorkspaceId(null);
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    }
  }

  async function createWorkspace(name) {
    const workspace = await apiCreateWorkspace(name);

    setWorkspaces((prev) => [...prev, workspace]);

    return workspace;
  }

  async function renameWorkspace(id, name) {
    const workspace = await apiRenameWorkspace(id, name);

    setWorkspaces((prev) => prev.map((w) => (w.id === id ? workspace : w)));
  }

  async function deleteWorkspace(id) {
    await apiDeleteWorkspace(id);

    setWorkspaces((prev) => prev.filter((w) => w.id !== id));

    if (currentWorkspaceId === id) {
      setCurrentWorkspaceId(null);
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        createWorkspace,
        renameWorkspace,
        deleteWorkspace,
        reloadWorkspaces: loadWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
