import { useState, useRef, useEffect } from "react";
import { Paperclip, Globe, Sparkles, Mic, SendHorizontal } from "lucide-react";

import { useChat } from "../../context/ChatContext";
import Input from "../ui/Input";
import AttachmentPreview from "../chat/AttachmentPreview";
import Dropzone from "../chat/Dropzone";

export default function PromptInput() {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    sendMessage({
      text,
      attachments,
    });

    setText("");
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };
  const handleFiles = (files) => {
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));

      const newFiles = files.filter(
        (f) => !existing.has(`${f.name}-${f.size}`),
      );

      return [...prev, ...newFiles];
    });
  };
  return (
    <div className="flex justify-center bg-[#080B14] px-6 pb-8 pt-4">
      <div className="mx-auto w-full max-w-3xl">
        <Dropzone onFiles={handleFiles}>
          <Input>
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <AttachmentPreview
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() =>
                      setAttachments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  />
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              cols={1}
              value={text}
              placeholder="Ask Mak-AI..."
              onChange={(e) => setText(e.target.value)}
              onInput={() => {
                const el = textareaRef.current;

                if (!el) return;

                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                width: "100%",
                minWidth: "100%",
              }}
              className="
                  block
                  w-full
                  min-w-full
                  resize-none
                  bg-transparent
                  text-[#F5F5F7]
                  placeholder:text-[#6B7280]
                  outline-none
                  border-0
                  max-h-40
                  overflow-y-auto
                "
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;

                setAttachments((prev) => [
                  ...prev,
                  ...Array.from(e.target.files),
                ]);

                // allow selecting the same file again later
                e.target.value = "";
              }}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                      rounded-xl
                      p-2
                      text-[#9CA3B5]
                      transition-all
                      hover:bg-[#1A2030]
                      hover:text-white
                      cursor-pointer
                    "
                >
                  <Paperclip size={18} />
                </button>

                <button
                  className="
                    rounded-xl
                    p-2
                    text-[#9CA3B5]
                    transition-all
                    hover:bg-[#1A2030]
                    hover:text-white
                    cursor-pointer
                  "
                >
                  <Globe size={18} />
                </button>

                <button
                  className="
                    rounded-xl
                    p-2
                    text-[#9CA3B5]
                    transition-all
                    hover:bg-[#1A2030]
                    hover:text-white
                    cursor-pointer
                  "
                >
                  <Sparkles size={18} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  className="
                  rounded-xl
                  p-2
                  text-[#9CA3B5]
                  transition-all
                  hover:bg-[#1A2030]
                  hover:text-white
                  cursor-pointer
                "
                >
                  <Mic size={18} />
                </button>
                <button
                  disabled={!text.trim() && attachments.length === 0}
                  onClick={handleSend}
                  className={`
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  transition-all duration-200

                  ${
                    text.trim() || attachments.length > 0
                      ? `
                        cursor-pointer
                        bg-gradient-to-br
                        from-[#5B4CFF]
                        via-[#7C3AED]
                        to-[#A855F7]
                        text-white
                        shadow-[0_0_18px_rgba(124,58,237,0.30)]
                        hover:scale-105
                      `
                      : `
                        cursor-not-allowed
                        bg-[#1A2030]
                        text-[#4B5563]
                      `
                  }
                `}
                >
                  <SendHorizontal size={18} />
                </button>
              </div>
            </div>
          </Input>
        </Dropzone>
      </div>
    </div>
  );
}
