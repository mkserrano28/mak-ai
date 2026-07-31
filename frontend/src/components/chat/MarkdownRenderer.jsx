import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

export default function MarkdownRenderer({ content }) {
  return (
      <div
        className="
          prose
          prose-sm
          prose-invert
          max-w-none

          prose-p:text-[13px]
          prose-p:leading-6
          prose-p:mb-3

          prose-li:text-[13px]
          prose-li:leading-6

          prose-headings:font-semibold
          prose-headings:text-white

          prose-h1:text-2xl
          prose-h2:text-xl
          prose-h3:text-lg

          prose-strong:text-white
          prose-code:text-cyan-300
          prose-pre:p-0
        "
      >

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <CodeBlock language={match[1]}>
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            ) : (
              <code
                className="rounded bg-[#1b4332] px-1 py-0.5"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

    </div>
  );
}