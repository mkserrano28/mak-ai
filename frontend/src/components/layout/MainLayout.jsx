import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import PromptInput from "../input/PromptInput";
import TopBar from "./TopBar";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const startResize = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const resize = (e) => {
      if (!isResizing) return;

      const width = Math.min(Math.max(e.clientX, 200), 300);

      setSidebarWidth(width);
    };

    const stopResize = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen bg-[#080B14] text-[#F5F5F7] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarWidth}
      />

      <div
        onMouseDown={startResize}
        className="
          fixed
          top-0
          z-50
          hidden
          h-screen
          w-1
          cursor-col-resize
          bg-transparent
          hover:bg-[#7C3AED]
          lg:block
        "
        style={{
          left: sidebarWidth - 2,
        }}
      />

      {/* Main Content */}
      <main
        className="flex flex-1 flex-col overflow-hidden"
        style={{
          marginLeft: window.innerWidth >= 1024 ? sidebarWidth : 0,
        }}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatWindow />

          <PromptInput />
        </div>
      </main>
    </div>
  );
}
