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
        /* IMAC-AI MESSAGE */
        <div className="flex w-full items-start gap-3">
          {/* IMAC-AI Avatar */}
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

                {message.powerpoint && (
                  <a
                    href={`http://127.0.0.1:8000${message.powerpoint.download_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                          mt-4
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          bg-[#5B4CFF]
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-white
                          transition
                          hover:bg-[#6D5CFF]
                        "
                  >
                    📊 Download PowerPoint
                  </a>
                )}

                <MessageSources sources={message.sources} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
