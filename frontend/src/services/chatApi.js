import { apiFetch } from "./api";

export async function sendChat(chatId, messages, documentIds = []) {
  const response = await apiFetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      messages,
      document_ids: documentIds,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to contact server");
  }

  return await response.json();
}
