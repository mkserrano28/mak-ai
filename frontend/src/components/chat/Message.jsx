import MarkdownRenderer from "./MarkdownRenderer";
import AttachmentPreview from "./AttachmentPreview";
import MessageSources from "./MessageSources";
import WorkflowPreview from "./WorkflowPreview";

export default function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`
        mb-6 flex w-full
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      {/* USER MESSAGE */}
      {isUser ? (
        <div
          className="
            ml-auto
            w-fit
            max-w-[75%]
            break-words
            rounded-2xl
            rounded-br-md
            border
            border-[#352A58]
            bg-[#1B1730]
            px-4
            py-3
            text-sm
            leading-relaxed
            text-[#F5F5F7]
          "
        >
          {message.attachments?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map((file, index) => (
                <AttachmentPreview
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() => {}}
                />
              ))}
            </div>
          )}

          <MarkdownRenderer content={message.content} />
        </div>
      ) : (
        /* MAK-AI MESSAGE */
        <div className="flex w-full items-start gap-3">
          {/* Mak-AI Avatar */}
          <div
            className="
              mt-1
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-gradient-to-br
              from-[#5B4CFF]
              via-[#7C3AED]
              to-[#A855F7]
              text-xs
              font-bold
              text-white
              shadow-[0_0_18px_rgba(124,58,237,0.25)]
            "
          >
            M
          </div>

          {/* Response */}
          <div
            className="
              min-w-0
              flex-1
              break-words
              pt-1
              text-sm
              leading-7
              text-[#E5E7EB]
            "
          >
            {message.attachments?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {message.attachments.map((file, index) => (
                  <AttachmentPreview
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => {}}
                  />
                ))}
              </div>
            )}

            {message.workflowPreview ? (
              <WorkflowPreview workflow={message.workflowPreview} />
            ) : (
              <>
                <MarkdownRenderer content={message.content} />

                <MessageSources sources={message.sources} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
