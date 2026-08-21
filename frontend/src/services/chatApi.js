import { apiFetch } from "./api";

export async function sendChat(chatId, messages, documentIds = []) {
  const latestMessage = messages[messages.length - 1];

  const response = await apiFetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      role: latestMessage.role,
      content: latestMessage.content,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to contact server");
  }

  return await response.json();
}
