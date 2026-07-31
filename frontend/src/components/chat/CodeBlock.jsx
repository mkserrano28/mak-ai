import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language = "text", children }) {
  const [copied, setCopied] = useState(false);

  const code = String(children ?? "").replace(/\n$/, "");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const displayLanguage =
    language && language !== "text" ? language.toUpperCase() : "CODE";

  return (
    <div
      className="
        my-4
        w-full
        overflow-hidden
        rounded-xl
        border
        border-[#252B3A]
        bg-[#0B0F18]
        shadow-[0_8px_30px_rgba(0,0,0,0.20)]
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[#252B3A]
          bg-[#111725]
          px-4
          py-2.5
        "
      >
        {/* Language */}
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-[#8B5CF6]" />

          <span
            className="
              text-[11px]
              font-medium
              tracking-wide
              text-[#9CA3B5]
            "
          >
            {displayLanguage}
          </span>
        </div>

        {/* Copy */}
        <button
          type="button"
          onClick={copyCode}
          className="
            flex
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            text-[#9CA3B5]
            transition-all
            hover:bg-[#1A2030]
            hover:text-white
          "
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#10B981]" />
              <span className="text-[#10B981]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "18px",
            background: "#0B0F18",
            fontSize: "13px",
            lineHeight: "1.7",
            borderRadius: 0,
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            },
          }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
