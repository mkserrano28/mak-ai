import { Menu } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  return (
    <header
      className="
        flex
        h-16
        items-center
        justify-between
        border-b
        border-[#1F2635]
        bg-[#080B14]
        px-4
        lg:px-8
      "
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="
            rounded-lg
            p-2
            text-[#9CA3B5]
            transition
            hover:bg-[#171D2C]
            hover:text-white
            lg:hidden
          "
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
