import { FileText, X } from "lucide-react";

export default function AttachmentItem({
  file,
  progress = 100,
  onRemove,
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <FileText className="text-cyan-600" />

          <div>

            <div className="font-medium text-sm">
              {file.name}
            </div>

            <div className="text-xs text-slate-500">
              {(file.size / 1024).toFixed(1)} KB
            </div>

          </div>

        </div>

        <button onClick={onRemove}>
          <X size={18} />
        </button>

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-cyan-500 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}