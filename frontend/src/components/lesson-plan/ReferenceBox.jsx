import { useRef } from "react";

export default function ReferenceUpload({ files, setFiles }) {
  const inputRef = useRef(null);

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFiles}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="text-sm text-gray-400 hover:text-white"
      >
        📎 Attach reference
      </button>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#111722] px-3 py-2"
            >
              <span className="truncate text-sm text-gray-300">
                📄 {file.name}
              </span>

              <button
                onClick={() => removeFile(index)}
                className="ml-3 text-xs text-gray-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
