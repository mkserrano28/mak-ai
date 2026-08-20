import { useState } from "react";

export default function PromptBox({ onGenerate }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    onGenerate(prompt);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-[#111722] shadow-2xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell IMAC-AI what lesson plan you need..."
          rows={6}
          className="w-full resize-none rounded-t-2xl bg-transparent px-5 py-5 text-sm text-white outline-none placeholder:text-gray-500"
        />

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          ></button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="rounded-lg bg-gradient-to-r from-[#5B4CFF] via-[#7C3AED] to-[#A855F7] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate
          </button>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs text-gray-500">Try asking IMAC-AI:</p>

        <div className="flex flex-wrap gap-2">
          {[
            "Create a Grade 12 Philosophy lesson plan for 5 sessions.",
            "Create a Grade 10 Science ILAW lesson plan about ecosystems.",
            "Create a Mathematics lesson plan about quadratic equations.",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-white/10 bg-[#111722] px-3 py-2 text-xs text-gray-400 transition hover:border-green-500/30 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
