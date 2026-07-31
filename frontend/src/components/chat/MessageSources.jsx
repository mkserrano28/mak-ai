import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Paperclip } from "lucide-react";

export default function MessageSources({ sources = [] }) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mt-4 max-w-2xl">
      {/* View / Hide Sources */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center gap-2
          text-xs font-medium
          text-[#A78BFA]
          transition-colors
          hover:text-[#C4B5FD]
        "
      >
        <Paperclip size={13} />

        <span>{open ? "Hide Sources" : "View Sources"}</span>

        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Sources Panel */}
      {open && (
        <div
          className="
            mt-3
            overflow-hidden
            rounded-xl
            border border-[#252B3A]
            bg-[#111725]
          "
        >
          {/* Header */}
          <div
            className="
              flex items-center justify-between
              border-b border-[#252B3A]
              px-4 py-2.5
            "
          >
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#7D8799]
              "
            >
              Sources
            </span>

            <span className="text-[10px] text-[#626B7D]">
              {sources.length} {sources.length === 1 ? "file" : "files"}
            </span>
          </div>

          {/* Files */}
          <div className="p-2">
            {sources.map((source, index) => {
              const pages = source.pages || [];

              return (
                <div
                  key={`${source.filename}-${index}`}
                  className="
                    group
                    flex items-center gap-3
                    rounded-lg
                    px-3 py-2.5
                    transition-colors
                    hover:bg-[#171D2C]
                  "
                >
                  {/* PDF icon */}
                  <div
                    className="
                      flex h-8 w-8
                      shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-[#7C3AED]/10
                      text-[#A855F7]
                    "
                  >
                    <FileText size={15} />
                  </div>

                  {/* File details */}
                  <div className="min-w-0 flex-1">
                    <p
                      title={source.filename}
                      className="
                        truncate
                        text-xs
                        font-medium
                        text-[#E8EAF0]
                      "
                    >
                      {source.filename}
                    </p>

                    {pages.length > 0 && (
                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-[#7D8799]
                        "
                      >
                        {pages.length === 1 ? "Page" : "Pages"}{" "}
                        {pages.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
