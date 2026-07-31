import { apiFetch } from "./api";

export async function getWorkspaces() {
  const response = await apiFetch("/api/workspaces");

  if (!response.ok) {
    throw new Error("Failed to fetch workspaces");
  }

  return await response.json();
}

export async function createWorkspace(name) {
  const response = await apiFetch("/api/workspaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data?.detail;

    const error = new Error(
      typeof detail === "string"
        ? detail
        : detail?.message || "Failed to create workspace",
    );

    error.status = response.status;
    error.code = detail?.code;
    error.limit = detail?.limit;
    error.data = data;

    throw error;
  }

  return data;
}

export async function renameWorkspace(workspaceId, name) {
  const response = await apiFetch(`/api/workspaces/${workspaceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to rename workspace");
  }

  return await response.json();
}

export async function deleteWorkspace(workspaceId) {
  const response = await apiFetch(`/api/workspaces/${workspaceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete workspace");
  }

  return await response.json();
}
