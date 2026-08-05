import { useState } from "react";
import { FolderPlus, X } from "lucide-react";

export default function CreateWorkspaceModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await onCreate(name);

    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#2A3144] bg-[#0F172A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-violet-400" size={22} />
            <h2 className="text-lg font-semibold text-white">
              Create Workspace
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-[#1E293B] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <label className="text-sm text-gray-300">Workspace Name</label>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal, Client A..."
            className="
              w-full rounded-xl
              border border-[#2A3144]
              bg-[#111827]
              px-4 py-3
              text-white
              placeholder:text-gray-500
              outline-none
              focus:border-violet-500
              focus:ring-2
              focus:ring-violet-500/20
            "
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#1E293B] px-6 py-4">
          <button
            onClick={onClose}
            className="
              rounded-xl
              border border-[#2A3144]
              px-5 py-2
              text-gray-300
              hover:bg-[#1E293B]
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-fuchsia-600
              px-6 py-2
              font-medium
              text-white
              transition
              hover:brightness-110
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
