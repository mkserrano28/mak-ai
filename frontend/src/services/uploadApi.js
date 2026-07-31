import { apiFetch } from "./api";

export async function uploadFiles(files, workspaceId) {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();

  formData.append("workspace_id", workspaceId);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiFetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data?.detail;

    const error = new Error(
      typeof detail === "string" ? detail : detail?.message || "Upload failed",
    );

    error.status = response.status;
    error.code = detail?.code;
    error.limit = detail?.limit;
    error.data = data;

    throw error;
  }

  return data.files || [];
}
