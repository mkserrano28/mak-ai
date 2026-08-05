import { FileText, X } from "lucide-react";

export default function AttachmentPreview({ file, onRemove }) {
  if (!file) return null;
  const fileName = file.name || file.filename;
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2">
      <div className="flex items-center gap-3">
        <FileText size={20} className="text-cyan-600" />

        <div>
          <p
            className="
              max-w-[180px]
              truncate
              text-xs
              font-medium
              text-[#1F2937]
            "
          >
            {fileName}
          </p>

          <p className="text-[10px] text-[#64748B]">{file.size}</p>
        </div>
      </div>

      <button onClick={onRemove} className="rounded-lg p-2 hover:bg-slate-100">
        <X size={18} />
      </button>
    </div>
  );
}
