import MessageList from "./MessageList";
import { useChat } from "../../context/ChatContext";
import { useRef, useEffect } from "react";
import EmptyState from "./EmptyState";

export default function ChatWindow() {
  const { messages, isTyping } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#080B14] text-[#F5F5F7]">
      <div className="mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-6 py-8">
        {messages.length === 0 && (
          <div className="flex min-h-[55vh] min-w-0 w-full items-center justify-center">
            <EmptyState />
          </div>
        )}

        {messages.length > 0 && <MessageList messages={messages} />}

        {isTyping && (
          <div className="mt-6 flex items-center gap-3">
            {/* Mak-AI avatar */}
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-[#5B4CFF] via-[#7C3AED] to-[#A855F7]
                font-semibold text-white
                shadow-[0_0_22px_rgba(124,58,237,0.25)]
              "
            >
              M
            </div>

            {/* Thinking animation */}
            <div
              className="
                flex items-center gap-1.5
                rounded-2xl
                border border-[#252B3A]
                bg-[#111725]
                px-4 py-3
              "
            >
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A855F7]" />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C3AED]"
                style={{ animationDelay: "0.15s" }}
              />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3B82F6]"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
