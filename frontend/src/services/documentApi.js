import { apiFetch } from "./api";

export async function getDocuments(workspaceId) {
  const response = await apiFetch(`/api/documents?workspace_id=${workspaceId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return await response.json();
}

export async function uploadDocument(workspaceId, file) {
  const formData = new FormData();

  formData.append("workspace_id", workspaceId);
  formData.append("file", file);

  const response = await apiFetch("/api/documents", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data?.detail;

    const error = new Error(
      typeof detail === "string"
        ? detail
        : detail?.message || "Failed to upload document",
    );

    error.status = response.status;
    error.code = detail?.code;
    error.limit = detail?.limit;
    error.data = data;

    throw error;
  }

  return data;
}

export async function deleteDocument(id) {
  const response = await apiFetch(`/api/documents/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }

  return await response.json();
}
