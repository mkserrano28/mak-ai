import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Search,
  Workflow,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

export default function WorkflowLibrary({
  workflows,
  loadWorkflow,
  deleteWorkflow,
  currentWorkflowId,
  workflowName,
  onNewWorkflow,
  isOpen,
  setIsOpen,
}) {
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);

  const safeWorkflows = Array.isArray(workflows) ? workflows : [];

  const filteredWorkflows = safeWorkflows.filter((workflow) =>
    (workflow.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoadWorkflow = async (workflowId) => {
    await loadWorkflow(workflowId);

    setIsOpen(false);
    setSearch("");
  };

  const handleNewWorkflow = () => {
    onNewWorkflow?.();

    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      {/* CURRENT WORKFLOW */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="
          flex
          min-w-[210px]
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-[#252B3A]
          bg-[#111725]
          px-3
          py-2
          text-left
          transition
          hover:border-[#353E52]
          hover:bg-[#151B29]
        "
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#7C3AED]/10
            "
          >
            <Workflow size={15} className="text-[#A855F7]" />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-xs
                font-medium
                text-[#F5F5F7]
              "
            >
              {workflowName || "Untitled Workflow"}
            </p>

            <div className="mt-0.5 flex items-center gap-1">
              <Check size={10} className="text-[#10B981]" />

              <span className="text-[9px] text-[#7D8799]">Saved</span>
            </div>
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`
            shrink-0
            text-[#7D8799]
            transition-transform
            duration-200

            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div
          className="
            absolute
            left-0
            top-[calc(100%+8px)]
            z-[100]
            w-[300px]
            overflow-hidden
            rounded-2xl
            border
            border-[#252B3A]
            bg-[#0D111C]
            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          "
        >
          {/* Search */}
          <div className="border-b border-[#1F2635] p-3">
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#252B3A]
                bg-[#111725]
                px-3
              "
            >
              <Search size={14} className="shrink-0 text-[#6B7280]" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows..."
                autoFocus
                className="
                  w-full
                  bg-transparent
                  py-2.5
                  text-xs
                  text-white
                  outline-none
                  placeholder:text-[#626B7D]
                "
              />
            </div>
          </div>

          {/* Label */}
          <div className="px-4 pb-1 pt-3">
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#626B7D]
              "
            >
              Saved workflows
            </span>
          </div>

          {/* Workflow list */}
          <div className="max-h-[280px] overflow-y-auto p-2">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map((workflow) => {
                const isActive =
                  String(currentWorkflowId) === String(workflow.id);

                return (
                  <div
                    key={workflow.id}
                    className={`
                      group
                      flex
                      items-center
                      gap-1
                      rounded-xl
                      transition

                      ${isActive ? "bg-[#7C3AED]/10" : "hover:bg-[#171D2C]"}
                    `}
                  >
                    {/* Load workflow */}
                    <button
                      type="button"
                      onClick={() => handleLoadWorkflow(workflow.id)}
                      className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-2.5
                        px-3
                        py-2.5
                        text-left
                      "
                    >
                      <Workflow
                        size={14}
                        className={
                          isActive ? "text-[#A855F7]" : "text-[#7D8799]"
                        }
                      />

                      <span
                        className={`
                          truncate
                          text-xs

                          ${
                            isActive
                              ? "font-medium text-white"
                              : "text-[#B5BBC7]"
                          }
                        `}
                      >
                        {workflow.name || "Untitled Workflow"}
                      </span>

                      {isActive && (
                        <Check
                          size={13}
                          className="
                            ml-auto
                            shrink-0
                            text-[#A855F7]
                          "
                        />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Delete workflow"
                      onClick={(event) => {
                        event.stopPropagation();

                        deleteWorkflow(workflow.id);
                      }}
                      className="
                        mr-2
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-[#626B7D]
                        opacity-0
                        transition
                        hover:bg-red-500/10
                        hover:text-red-400
                        group-hover:opacity-100
                      "
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <p className="text-xs text-[#626B7D]">No workflows found</p>
              </div>
            )}
          </div>

          {/* New Workflow */}
          <div className="border-t border-[#1F2635] p-2">
            <button
              type="button"
              onClick={handleNewWorkflow}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-medium
                text-[#C4B5FD]
                transition
                hover:bg-[#7C3AED]/10
                hover:text-white
              "
            >
              <Plus size={14} />
              Create new workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
