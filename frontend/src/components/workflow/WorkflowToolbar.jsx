import { useState } from "react";
import {
  Plus,
  Sparkles,
  MoreHorizontal,
  Rocket,
  Copy,
  Download,
  Upload,
  Save,
  Check,
  ChevronDown,
} from "lucide-react";

import NodePalette from "./NodePalette";
import WorkflowLibrary from "./WorkflowLibrary";

export default function WorkflowToolbar({
  workflows,
  currentWorkflowId,
  loadWorkflow,
  deleteWorkflow,

  workflowName,
  setWorkflowName,
  aiPrompt,
  setAiPrompt,
  isGenerating,
  onGenerateWorkflow,
  onNewWorkflow,
  onAddNode,
  onDuplicateNode,
  onExport,
  onImport,
  onSave,
  onDeploy,
}) {
  const [showPalette, setShowPalette] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showWorkflowLibrary, setShowWorkflowLibrary] = useState(false);

  return (
    <>
      {/* TOP HEADER */}
      <div
        className="
          absolute
          left-0
          right-0
          top-0
          z-30
          flex
          h-16
          items-center
          justify-between
          border-b
          border-[#1F2635]
          bg-[#0D111C]/95
          px-5
          backdrop-blur-xl
        "
      >
        <WorkflowLibrary
          workflows={workflows}
          currentWorkflowId={currentWorkflowId}
          workflowName={workflowName}
          loadWorkflow={loadWorkflow}
          deleteWorkflow={deleteWorkflow}
          onNewWorkflow={onNewWorkflow}
          isOpen={showWorkflowLibrary}
          setIsOpen={setShowWorkflowLibrary}
        />
        {/* Header actions */}
        <div className="flex items-center gap-2">
          {/* More */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMore((current) => !current)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-[#252B3A]
                bg-[#111725]
                text-[#9CA3B5]
                transition
                hover:bg-[#171D2C]
                hover:text-white
              "
            >
              <MoreHorizontal size={17} />
            </button>

            {showMore && (
              <div
                className="
                  absolute
                  right-0
                  top-11
                  z-50
                  w-44
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#252B3A]
                  bg-[#111725]
                  p-1
                  shadow-2xl
                "
              >
                <MenuButton
                  icon={Save}
                  label="Save"
                  onClick={() => {
                    onSave();
                    setShowMore(false);
                  }}
                />

                <MenuButton
                  icon={Copy}
                  label="Duplicate node"
                  onClick={() => {
                    onDuplicateNode();
                    setShowMore(false);
                  }}
                />

                <MenuButton
                  icon={Download}
                  label="Export workflow"
                  onClick={() => {
                    onExport();
                    setShowMore(false);
                  }}
                />

                <MenuButton
                  icon={Upload}
                  label="Import workflow"
                  onClick={() => {
                    onImport();
                    setShowMore(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Deploy */}
          <button
            type="button"
            onClick={onDeploy}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#5B4CFF]
              via-[#7C3AED]
              to-[#A855F7]
              px-4
              py-2.5
              text-xs
              font-medium
              text-white
              shadow-[0_0_20px_rgba(124,58,237,0.20)]
              transition
              hover:brightness-110
            "
          >
            <Rocket size={15} />
            Deploy
          </button>
        </div>
      </div>
      {!showWorkflowLibrary && (
        <div
          className="
      absolute
      left-4
      top-24
      z-20
      w-[160px]
      rounded-2xl
      border
      border-[#252B3A]
      bg-[#0D111C]/95
      p-2
      shadow-[0_16px_40px_rgba(0,0,0,0.30)]
      backdrop-blur-xl
    "
        >
          <p
            className="
        px-3
        pb-2
        pt-1
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.15em]
        text-[#626B7D]
      "
          >
            Tools
          </p>

          <ToolButton
            icon={Plus}
            label="Add Node"
            onClick={() => {
              setShowPalette((current) => !current);
              setShowAi(false);
            }}
          />

          <ToolButton
            icon={Sparkles}
            label="AI Generate"
            accent
            onClick={() => {
              setShowAi((current) => !current);
              setShowPalette(false);
            }}
          />

          {showAi && (
            <div
              className="
          mt-2
          rounded-xl
          border
          border-[#7C3AED]/30
          bg-[#111725]
          p-2
        "
            >
              <textarea
                value={aiPrompt ?? ""}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your workflow..."
                rows={4}
                disabled={isGenerating}
                className="
            w-full
            resize-none
            bg-transparent
            text-[11px]
            leading-4
            text-white
            outline-none
            placeholder:text-[#626B7D]
          "
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                    e.preventDefault();
                    onGenerateWorkflow();
                  }
                }}
              />

              <button
                type="button"
                onClick={onGenerateWorkflow}
                disabled={isGenerating || !aiPrompt?.trim()}
                className="
            mt-2
            flex
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-[#7C3AED]
            px-2
            py-2
            text-[10px]
            font-medium
            text-white
            transition
            hover:bg-[#8B5CF6]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
              >
                <Sparkles size={12} />

                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NODE PALETTE */}
      {showPalette && (
        <div
          className="
            absolute
            left-[188px]
            top-20
            z-40
          "
        >
          <NodePalette
            onSelectNode={(type) => {
              onAddNode(type);
              setShowPalette(false);
            }}
          />
        </div>
      )}
    </>
  );
}

function ToolButton({ icon: Icon, label, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-2.5
        rounded-xl
        px-3
        py-2.5
        text-xs
        transition

        ${
          accent
            ? `
              text-[#C4B5FD]
              hover:bg-[#7C3AED]/10
            `
            : `
              text-[#AAB1BF]
              hover:bg-[#171D2C]
              hover:text-white
            `
        }
      `}
    >
      <Icon
        size={15}
        className={accent ? "text-[#A855F7]" : "text-[#8B93A5]"}
      />

      {label}
    </button>
  );
}

function MenuButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-2.5
        rounded-lg
        px-3
        py-2.5
        text-left
        text-xs
        text-[#AAB1BF]
        transition
        hover:bg-[#1A2030]
        hover:text-white
      "
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
