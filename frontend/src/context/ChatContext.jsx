import { createContext, useContext, useState, useEffect } from "react";
import { chats as mockChats } from "../data/chats";
import { sendChat } from "../services/chatApi";
import { uploadFiles } from "../services/uploadApi";
import {
  getChats,
  getChat,
  createChat,
  deleteChat,
  renameChat,
} from "../services/chatHistoryApi";
import { useWorkspace } from "./WorkspaceContext";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);

  const [chatId, setCurrentchatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const { currentWorkspaceId } = useWorkspace();

  useEffect(() => {
    const token = localStorage.getItem("makai_access_token");

    if (!token) {
      setChats([]);
      setCurrentchatId(null);
      return;
    }
    console.log("currentWorkspaceId:", currentWorkspaceId);

    if (!currentWorkspaceId) {
      setChats([]);
      setCurrentchatId(null);
      return;
    }

    loadChats();
  }, [currentWorkspaceId]);
  async function loadChats() {
    const token = localStorage.getItem("makai_access_token");

    if (!token || !currentWorkspaceId) {
      setChats([]);
      setCurrentchatId(null);
      return;
    }

    try {
      const data = await getChats(currentWorkspaceId);

      setChats(
        data.map((chat) => ({
          ...chat,
          messages: chat.messages || [],
        })),
      );

      if (data.length > 0) {
        setCurrentchatId((currentId) => {
          const stillExists = data.some((chat) => chat.id === currentId);

          return stillExists ? currentId : data[0].id;
        });
      } else {
        setCurrentchatId(null);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }
  const currentChat = chats.find((chat) => chat.id === chatId);

  const messages = currentChat?.messages || [];
  const selectChat = async (id) => {
    try {
      const chat = await getChat(id);

      setChats((prev) => prev.map((c) => (c.id === id ? chat : c)));

      setCurrentchatId(id);
    } catch (error) {
      console.error(error);
    }
  };

  const newChat = async () => {
    if (!currentWorkspaceId) {
      alert("Please create or select a workspace first.");
      return;
    }

    try {
      console.log("Creating chat in workspace:", currentWorkspaceId);

      const chat = await createChat(currentWorkspaceId);

      chat.messages = [];

      await loadChats();

      setCurrentchatId(chat.id);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };
  const removeChat = async (activechatId) => {
    try {
      await deleteChat(activechatId);

      setChats((prev) => prev.filter((chat) => chat.id !== activechatId));

      if (chatId === activechatId) {
        const nextChat = chats.find((c) => c.id !== activechatId);

        setCurrentchatId(nextChat ? nextChat.id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renameCurrentChat = async (activechatId, title) => {
    try {
      const updated = await renameChat(activechatId, title);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activechatId
            ? {
                ...chat,
                title: updated.title,
              }
            : chat,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async ({ text, attachments }) => {
    if (!text.trim() && attachments.length === 0) return;

    // Now create the user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      attachments,
    };

    let activeChatId = chatId;

    // Automatically create a chat if none exists
    // Automatically create a chat if none exists
    if (!activeChatId) {
      console.log("currentWorkspaceId:", currentWorkspaceId);
      console.log("activeChatId:", activeChatId);

      const chat = await createChat(currentWorkspaceId);

      await loadChats();

      setCurrentchatId(chat.id);

      activeChatId = chat.id;
    }
    const activeChat = chats.find((chat) => chat.id === activeChatId);

    const existingMessages = activeChat?.messages ?? [];

    // Add the user message
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat"
                  ? text.slice(0, 30) || "New Chat"
                  : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat,
      ),
    );

    setIsTyping(true);

    try {
      // Upload first
      const uploadedFiles = await uploadFiles(attachments, currentWorkspaceId);

      const documentIds = uploadedFiles.map((file) => file.id).filter(Boolean);

      const conversation = [...existingMessages, userMessage].map(
        (message) => ({
          role: message.role,
          content: message.content,
        }),
      );

      const data = await sendChat(activeChatId, conversation, documentIds);

      console.log("===== IMAC-AI ATTACHMENT DEBUG =====");
      console.log("Uploaded response:", uploadedFiles);
      console.log("Document IDs:", documentIds);
      console.log("Attachments:", attachments);
      console.log("==================================");

      console.log("API Response:", data);

      const preview = data.workflow_preview ?? data.workflow;

      if (preview) {
        console.log("Updating workflow:", preview);
        setWorkflow(preview);
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        sources: data.sources || [],
        workflowPreview: data.workflow_preview || null,
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
              }
            : chat,
        ),
      );
    } catch (error) {
      console.error(error);

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "⚠️ Unable to connect to IMAC-AI backend.",
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
              }
            : chat,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        chatId,
        currentChat,
        messages,
        selectChat,
        newChat,
        sendMessage,
        isTyping,
        removeChat,
        renameCurrentChat,
        workflow,
        setWorkflow,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
