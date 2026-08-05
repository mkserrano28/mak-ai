import { apiFetch } from "./api";

export async function getChats(workspaceId = null) {
  let endpoint = "/api/chats";

  if (workspaceId) {
    endpoint += `?workspace_id=${workspaceId}`;
  }

  const response = await apiFetch(endpoint);

  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }

  return await response.json();
}

export async function getChat(chatId) {
  const response = await apiFetch(`/api/chats/${chatId}`);

  if (!response.ok) {
    throw new Error("Failed to load chat");
  }

  return await response.json();
}

export async function createChat(workspaceId) {
  console.log("Creating chat with workspaceId:", workspaceId);

  const response = await apiFetch("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspace_id: workspaceId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Backend error:", error);
    throw new Error(JSON.stringify(error));
  }

  return await response.json();
}

export async function deleteChat(chatId) {
  const response = await apiFetch(`/api/chats/${chatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(error);
    throw new Error(JSON.stringify(error));
  }

  return await response.json();
}

export async function renameChat(chatId, title) {
  const response = await apiFetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to rename chat");
  }

  return await response.json();
}
