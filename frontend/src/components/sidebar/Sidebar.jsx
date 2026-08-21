import {
  Plus,
  Settings,
  SquarePen,
  Search,
  MessageSquare,
  MoreHorizontal,
  LogOut,
  CreditCard,
  User,
  ChevronUp,
  X,
  BookOpen,
} from "lucide-react";

import Button from "../ui/Button";
import { useChat } from "../../context/ChatContext";
import { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import DocumentList from "./DocumentList";
import { useNavigate } from "react-router-dom";
import PricingModal from "../subscription/PricingModal";

import {
  getSubscription,
  mockUpgradeToPro,
} from "../../services/subscriptionApi";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

const menuItems = [];

export default function Sidebar({ isOpen, onClose, width }) {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("makai_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      {
        user?.subscription_plan || "free";
      }
      Plan;
      return null;
    }
  });
  const handleLogout = () => {
    localStorage.removeItem("makai_access_token");
    localStorage.removeItem("makai_user");

    navigate("/login", {
      replace: true,
    });
  };
  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    createWorkspace,
  } = useWorkspace();

  const { chats, chatId, selectChat, newChat, removeChat, renameCurrentChat } =
    useChat();

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase()),
  );
  const handleOpenSubscription = async () => {
    try {
      const data = await getSubscription();

      setSubscription(data);
      setShowPricing(true);
      setProfileOpen(false);
    } catch (error) {
      console.error("Failed to load subscription:", error);

      alert("Unable to load subscription.");
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);

      await mockUpgradeToPro();

      const updated = await getSubscription();

      setSubscription(updated);

      alert("Welcome to IMAC-AI Pro!");

      setShowPricing(false);
    } catch (error) {
      console.error("Upgrade failed:", error);

      alert(error.message || "Unable to upgrade.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="
          fixed inset-0 z-40
          bg-black/50
          backdrop-blur-[1px]
          lg:hidden
        "
        />
      )}
      <aside
        style={{
          width: `min(${width}px, 85vw)`,
        }}
        className={`
          fixed
          left-0
          top-0
          z-50
          text-xs
          flex
          h-screen
          flex-col
          bg-[#0D111C]
          border-r
          border-[#1F2635]
          text-[#F5F5F7]
          transition-transform
          duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="makai-logo">
                  <div className="makai-logo-orbit makai-logo-orbit-1" />

                  <div className="makai-logo-core">M</div>

                  <div className="makai-logo-dot" />
                </div>

                <h1 className="text-xl font-bold tracking-tight">IMAC-AI</h1>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    text-[#8B93A5]
                    transition
                    hover:bg-[#171D2C]
                    hover:text-white
                    lg:hidden
                  "
                aria-label="Close sidebar"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-2">
          <button
            onClick={newChat}
            className="
              flex w-full items-center justify-center gap-2
              rounded-xl
              bg-gradient-to-r from-[#5B4CFF] via-[#7C3AED] to-[#A855F7]
              py-3
              text-sm font-medium text-white
              shadow-[0_0_20px_rgba(124,58,237,0.20)]
              transition-all
              hover:brightness-110
            "
          >
            <Plus size={10} />
            <SquarePen size={18} />
            New Chat
          </button>

          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="
              flex w-full items-center justify-center gap-2
              rounded-xl
              border border-[#252B3A]
              bg-[#111725]
              py-3
              text-sm
              text-[#D1D5DB]
              transition
              hover:bg-[#171D2C]
            "
          >
            📁 New Workspace
          </button>
        </div>
        <div className="mt-4 px-5 text-xs font-semibold">Workspaces</div>

        <div className="mt-3 max-h-40 overflow-y-auto px-4 space-y-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setCurrentWorkspaceId(workspace.id)}
              className={`w-full rounded-md px-2 py-1.5 text-left transition ${
                currentWorkspaceId === workspace.id
                  ? "bg-[#7C3AED]/15 text-white border border-[#7C3AED]/30"
                  : "text-[#9CA3B5] hover:bg-[#171D2C] hover:text-white"
              }`}
            >
              📁 {workspace.name}
            </button>
          ))}
        </div>
        <CreateWorkspaceModal
          isOpen={showWorkspaceModal}
          onClose={() => setShowWorkspaceModal(false)}
          onCreate={async (name) => {
            try {
              const workspace = await createWorkspace(name);

              setCurrentWorkspaceId(workspace.id);

              setShowWorkspaceModal(false);
            } catch (err) {
              console.error(err);
              alert(err.message);
            }
          }}
        />

        <div className="mt-5 px-5 text-xs font-semibold">Chats</div>
        <div className="mt-4 px-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                border-[#252B3A]
                bg-[#111725]
                py-2.5
                pl-10
                pr-4
                text-xs
                text-white
                placeholder:text-[#6B7280]
                outline-none
                transition
                focus:border-[#7C3AED]
                focus:ring-2
                focus:ring-[#7C3AED]/10
              "
            />
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group mb-1 flex items-center justify-between transition ${
                  chatId === chat.id
                    ? "rounded-lg bg-[#171D2C] text-white"
                    : "text-[#9CA3B5]"
                }`}
              >
                {/* Chat Title */}
                <button
                  onClick={() => {
                    selectChat(chat.id);
                    onClose();
                  }}
                  className="  flex
        flex-1
        items-center
        gap-2
        rounded-lg
        px-2
        py-1.5
        text-left
        text-xs
        transition
        hover:bg-[#171D2C]
        hover:text-white"
                >
                  <MessageSquare
                    size={16}
                    className={
                      chatId === chat.id ? "text-black" : "text-slate-200"
                    }
                  />

                  {editingId === chat.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        renameCurrentChat(chat.id, editingTitle);
                        setEditingId(null);
                        setOpenMenu(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameCurrentChat(chat.id, editingTitle);
                          setEditingId(null);
                          setOpenMenu(null);
                        }
                      }}
                      className="w-full rounded border px-2 py-1 text-xs"
                    />
                  ) : (
                    <span className="truncate text-xs">{chat.title}</span>
                  )}
                </button>

                {/* 👇 PUT THE DROPDOWN HERE */}
                <div
                  ref={openMenu === chat.id ? menuRef : null}
                  className="relative"
                >
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === chat.id ? null : chat.id)
                    }
                    className="
          rounded-lg
          p-2
          opacity-0
          transition
          group-hover:opacity-100
          hover:bg-white
        "
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {openMenu === chat.id && (
                    <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white text-xs shadow-lg">
                      <button
                        onClick={() => {
                          setEditingId(chat.id);
                          setEditingTitle(chat.title);
                          setOpenMenu(null);
                        }}
                        className="
                            block
                            w-full
                            px-4
                            py-2
                            text-left
                            text-gray-700
                            hover:bg-gray-100
                            hover:text-gray-900
                          "
                      >
                        Rename
                      </button>

                      <button
                        onClick={() => {
                          removeChat(chat.id);
                          setOpenMenu(null);
                        }}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <DocumentList />
          </nav>
        </div>

        <div className="relative border-t border-[#1F2635] px-4 py-3">
          {profileOpen && (
            <div
              className="
        absolute
        bottom-[82px]
        left-4
        right-4
        z-50
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-xl
      "
            >
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-[#F5F5F7]">
                  {user?.name || "IMAC-AI User"}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {user?.email || ""}
                </p>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-left
            text-sm
            text-gray-700
            hover:bg-gray-100
          "
                >
                  <User size={17} />
                  Account
                </button>

                <button
                  type="button"
                  onClick={handleOpenSubscription}
                  className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  text-gray-700
                  hover:bg-gray-100
                "
                >
                  <CreditCard size={17} />
                  Subscription
                </button>

                <button
                  type="button"
                  className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-left
            text-sm
            text-gray-700
            hover:bg-gray-100
          "
                >
                  <Settings size={17} />
                  Settings
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-left
            text-sm
            text-red-600
            hover:bg-red-50
          "
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className="
      flex
      w-full
      items-center
      gap-3
      rounded-xl
      p-2
      text-left
      transition
      hover:bg-[#171D2C]
    "
          >
            <div
              className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-gradient-to-br from-[#5B4CFF] to-[#A855F7]
        text-sm
        font-bold
        text-white
      "
            >
              {getInitials(user?.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F5F5F7]">
                {user?.name || "IMAC-AI User"}
              </p>

              <p className="truncate text-xs text-[#8B93A5] capitalize">
                {subscription?.plan || user?.subscription_plan || "free"} Plan
              </p>
            </div>

            <ChevronUp
              size={17}
              className={`
        transition-transform
        ${profileOpen ? "rotate-180" : ""}
      `}
            />
          </button>
        </div>
      </aside>

      {showPricing && (
        <PricingModal
          subscription={subscription}
          onClose={() => setShowPricing(false)}
          onUpgrade={handleUpgrade}
          upgrading={upgrading}
        />
      )}
    </>
  );
}
