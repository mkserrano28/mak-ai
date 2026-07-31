import { MessageSquare } from "lucide-react";

export default function SidebarItem({ title }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800">

      <MessageSquare size={16} />

      <span className="truncate">
        {title}
      </span>

    </button>
  );
}