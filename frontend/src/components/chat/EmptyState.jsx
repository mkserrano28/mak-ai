import {
  BookOpen,
  ClipboardCheck,
  FileOutput,
  Gamepad2,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    icon: BookOpen,
    title: "Lesson Planner",
    description: "Create ILAW lesson plans",
  },
  {
    icon: ClipboardCheck,
    title: "Quiz Checker",
    description: "Check student quiz papers",
  },
  {
    icon: FileOutput,
    title: "File Converter",
    description: "Convert documents and files",
  },
  {
    icon: Gamepad2,
    title: "Bamboozle",
    description: "Classroom team challenge",
  },
  {
    icon: FileText,
    title: "Exam Generator",
    description: "Create exams and download Word files",
  },
];

export default function EmptyState() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("chat");

  return (
    <div
      className="
          flex
          w-full
          min-w-0
          max-w-full
          flex-col
          items-center
          justify-center
          overflow-hidden
          px-2
        "
    >
      {/* IMAC-AI Orbital Logo */}
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        {/* Outer orbit */}
        <div
          className="
            absolute
            h-24
            w-16
            rotate-45
            rounded-[50%]
            border
            border-[#7C3AED]/50
          "
        />

        {/* Second orbit */}
        <div
          className="
            absolute
            h-16
            w-24
            -rotate-12
            rounded-[50%]
            border
            border-[#3B82F6]/30
          "
        />

        {/* Glow */}
        <div
          className="
            absolute
            h-14
            w-14
            rounded-full
            bg-[#7C3AED]/20
            blur-xl
          "
        />

        {/* M */}
        <div
          className="
            relative
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-[#5B4CFF]
            via-[#7C3AED]
            to-[#A855F7]
            text-xl
            font-bold
            text-white
            shadow-[0_0_30px_rgba(124,58,237,0.35)]
          "
        >
          M
        </div>

        {/* Orbit dot */}
        <div
          className="
            absolute
            right-2
            top-4
            h-2
            w-2
            rounded-full
            bg-[#3B82F6]
            shadow-[0_0_10px_#3B82F6]
          "
        />
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-medium tracking-tight text-[#F5F5F7]">
          What should we{" "}
          <span
            className="
              bg-gradient-to-r
              from-[#A855F7]
              to-[#3B82F6]
              bg-clip-text
              text-transparent
            "
          >
            build?
          </span>
        </h1>

        <p className="mt-3 text-sm text-[#9CA3B5]">
          Ask, automate, or run a workflow.
        </p>
      </div>

      {/* Mode selector */}
      <div
        className="
          mt-7
          flex
          items-center
          rounded-xl
          border
          border-[#252B3A]
          bg-[#111725]
          p-1
        "
      ></div>

      {/* Quick actions */}
      <div
        className="
          mt-7
          flex
          w-full
          max-w-2xl
          flex-wrap
          justify-center
          gap-2
          px-2
        "
      >
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.title}
              onClick={() => {
                if (item.title === "Lesson Planner") {
                  navigate("/lesson-plan");
                }

                if (item.title === "Quiz Checker") {
                  navigate("/quiz-checker");
                }
                if (item.title === "File Converter") {
                  navigate("/file-converter");
                }
                if (item.title === "Bamboozle") {
                  navigate("/bamboozle");
                }
                if (item.title === "Exam Generator") {
                  navigate("/exam-generator");
                }
              }}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#252B3A]
                bg-[#0D111C]
                px-4
                py-2
                text-xs
                text-[#B5BBC7]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-[#7C3AED]/60
                hover:bg-[#111725]
                hover:text-white
              "
            >
              <Icon
                size={14}
                className="
                  text-[#8B5CF6]
                  transition-colors
                  group-hover:text-[#A855F7]
                "
              />

              {item.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
