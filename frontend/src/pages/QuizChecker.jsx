import { useState } from "react";
import {
  Upload,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function QuizChecker() {
  const navigate = useNavigate();

  const [questionCount, setQuestionCount] = useState(5);
  const [answers, setAnswers] = useState(Array(5).fill("A"));

  const [studentImage, setStudentImage] = useState(null);
  const [studentPreview, setStudentPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // QUESTION COUNT
  // ============================================================

  const handleQuestionCount = (event) => {
    const value = Math.max(1, Math.min(100, Number(event.target.value) || 1));

    setQuestionCount(value);

    setAnswers((previous) => {
      const next = [...previous];

      if (value > next.length) {
        while (next.length < value) {
          next.push("A");
        }
      } else {
        next.length = value;
      }

      return next;
    });

    setResult(null);
    setError("");
  };

  // ============================================================
  // ANSWER KEY
  // ============================================================

  const updateAnswer = (index, value) => {
    setAnswers((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });

    setResult(null);
    setError("");
  };

  // ============================================================
  // STUDENT PAPER
  // ============================================================

  const handleStudentFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    setStudentImage(file);
    setStudentPreview(preview);
    setResult(null);
    setError("");
  };

  // ============================================================
  // CHECK QUIZ
  // ============================================================

  const checkStudentQuiz = async () => {
    if (!studentImage) {
      setError("Please upload the student's completed paper.");
      return;
    }

    if (answers.length !== questionCount) {
      setError("Please complete the answer key.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      /*
       * Build the manual answer key.
       *
       * The teacher's answers are the source of truth.
       * Mak-AI only reads the student's answers.
       */
      const answerKey = {};

      answers.forEach((answer, index) => {
        answerKey[String(index + 1)] = {
          type: "multiple_choice",
          correct_answer: answer,
          max_score: 1,
        };
      });

      const formData = new FormData();

      formData.append("answer_key", JSON.stringify(answerKey));

      formData.append("image", studentImage);

      const response = await fetch(`${API_BASE_URL}/api/quiz/check`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to check the student's quiz.");
      }

      setResult(data);
    } catch (err) {
      console.error("Quiz checking error:", err);

      setError(err.message || "Something went wrong while checking the quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const reset = () => {
    setQuestionCount(5);
    setAnswers(Array(5).fill("A"));

    setStudentImage(null);
    setStudentPreview(null);

    setResult(null);
    setError("");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* BACK */}
        <button
          onClick={() => navigate("/chat")}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-gradient-to-r
            from-[#5B4CFF]
            via-[#7C3AED]
            to-[#A855F7]
            px-4
            py-2
            text-xs
            font-medium
            text-slate-300
            transition
            hover:text-white
          "
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <header className="mb-8">
          <div
            className="
            mb-3
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-violet-500/20
            bg-violet-500/10
            px-3
            py-1.5
            text-xs
            font-medium
            text-violet-300
          "
          >
            <ClipboardCheck size={14} />
            Mak-AI Education
          </div>

          <h1
            className="
            text-3xl
            font-semibold
            tracking-tight
            sm:text-4xl
          "
          >
            Quiz Checker
          </h1>

          <p
            className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-400
          "
          >
            Enter the correct answers, upload the student's completed paper, and
            let Mak-AI check the quiz automatically.
          </p>
        </header>

        {/* PROGRESS */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <StepPill
            number="1"
            label="Answer Key"
            active={!result}
            complete={Boolean(result)}
          />

          <ChevronRight size={14} className="text-slate-600" />

          <StepPill
            number="2"
            label="Student Paper"
            active={!result}
            complete={Boolean(result)}
          />

          <ChevronRight size={14} className="text-slate-600" />

          <StepPill
            number="3"
            label="Result"
            active={Boolean(result)}
            complete={false}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="
            mb-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            p-4
            text-sm
            text-red-300
          "
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            ANSWER KEY
        ====================================================== */}

        {!result && (
          <>
            <section
              className="
              rounded-3xl
              border
              border-white/10
              bg-[#0c101b]
              p-5
              shadow-2xl
              shadow-black/20
              sm:p-7
            "
            >
              <div
                className="
                mb-6
                flex
                items-start
                gap-4
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
                  rounded-xl
                  bg-violet-600/15
                  text-violet-300
                "
                >
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Answer Key</h2>

                  <p
                    className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                  >
                    Enter the correct answer for each multiple-choice question.
                  </p>
                </div>
              </div>

              {/* QUESTION COUNT */}

              <div
                className="
                mb-6
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
              >
                <div>
                  <p
                    className="
                    text-sm
                    font-medium
                    text-slate-300
                  "
                  >
                    Number of Questions
                  </p>

                  <p
                    className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                  >
                    Multiple choice only
                  </p>
                </div>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={handleQuestionCount}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#080b14]
                    px-4
                    py-3
                    text-sm
                    text-slate-200
                    outline-none
                    transition
                    focus:border-violet-500/60
                    sm:w-32
                  "
                />
              </div>

              {/* ANSWER GRID */}

              <div
                className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
              >
                {answers.map((answer, index) => (
                  <AnswerInput
                    key={index}
                    number={index + 1}
                    value={answer}
                    onChange={(value) => updateAnswer(index, value)}
                  />
                ))}
              </div>
            </section>

            {/* STUDENT PAPER */}

            <section
              className="
              mt-5
              rounded-3xl
              border
              border-white/10
              bg-[#0c101b]
              p-5
              shadow-2xl
              shadow-black/20
              sm:p-7
            "
            >
              <div
                className="
                mb-6
                flex
                items-start
                gap-4
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
                  rounded-xl
                  bg-violet-600/15
                  text-violet-300
                "
                >
                  <Upload size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Student Paper</h2>

                  <p
                    className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                  >
                    Upload the student's completed multiple-choice paper.
                  </p>
                </div>
              </div>

              <UploadCard
                preview={studentPreview}
                file={studentImage}
                onChange={handleStudentFile}
              />

              <PrimaryButton
                onClick={checkStudentQuiz}
                disabled={!studentImage || loading}
                loading={loading}
                loadingText="Mak-AI is checking the quiz..."
                icon={<ClipboardCheck size={17} />}
              >
                Check Quiz
              </PrimaryButton>
            </section>
          </>
        )}

        {/* =====================================================
            RESULT
        ====================================================== */}

        {result && (
          <>
            <QuizResult result={result} />

            <SecondaryButton onClick={reset} icon={<RotateCcw size={16} />}>
              Check Another Quiz
            </SecondaryButton>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEP PILL
============================================================ */

function StepPill({ number, label, active, complete }) {
  return (
    <div
      className={`
        flex
        items-center
        gap-2
        rounded-full
        px-3
        py-1.5
        ${
          active
            ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
            : complete
              ? "text-emerald-400"
              : "text-slate-600"
        }
      `}
    >
      <span
        className="
        flex
        h-5
        w-5
        items-center
        justify-center
        rounded-full
        bg-white/5
        text-[10px]
        font-semibold
      "
      >
        {complete ? <CheckCircle2 size={13} /> : number}
      </span>

      <span>{label}</span>
    </div>
  );
}

/* ============================================================
   ANSWER INPUT
============================================================ */

function AnswerInput({ number, value, onChange }) {
  return (
    <div
      className="
      flex
      items-center
      gap-3
      rounded-2xl
      border
      border-white/[0.07]
      bg-white/[0.015]
      p-3
      transition
      hover:border-violet-500/30
      hover:bg-white/[0.025]
    "
    >
      <div
        className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-violet-500/10
        text-xs
        font-semibold
        text-violet-300
      "
      >
        {number}
      </div>

      <div className="flex-1">
        <p
          className="
          mb-1.5
          text-[10px]
          uppercase
          tracking-wider
          text-slate-600
        "
        >
          Correct Answer
        </p>

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#080b14]
            px-3
            py-2
            text-sm
            font-medium
            text-slate-200
            outline-none
            focus:border-violet-500/60
          "
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
    </div>
  );
}

/* ============================================================
   UPLOAD CARD
============================================================ */

function UploadCard({ preview, file, onChange }) {
  return (
    <label
      className="
      group
      relative
      block
      min-h-80
      cursor-pointer
      overflow-hidden
      rounded-2xl
      border
      border-dashed
      border-slate-700
      bg-[#080b14]
      transition
      hover:border-violet-500/60
      hover:bg-violet-500/[0.02]
    "
    >
      {preview ? (
        <div
          className="
          flex
          min-h-80
          flex-col
          items-center
          justify-center
          p-5
        "
        >
          <img
            src={preview}
            alt="Student paper"
            className="
              max-h-[420px]
              max-w-full
              rounded-xl
              object-contain
            "
          />

          {file && (
            <div
              className="
              mt-4
              flex
              max-w-full
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/[0.03]
              px-3
              py-1.5
              text-xs
              text-slate-400
            "
            >
              <FileImage size={14} />

              <span
                className="
                max-w-[280px]
                truncate
              "
              >
                {file.name}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="
          flex
          min-h-80
          flex-col
          items-center
          justify-center
          px-6
          text-center
        "
        >
          <div
            className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-violet-600/10
            text-violet-300
            transition
            group-hover:scale-105
          "
          >
            <Upload size={24} />
          </div>

          <p
            className="
            font-medium
            text-slate-200
          "
          >
            Upload Student Paper
          </p>

          <p
            className="
            mt-2
            text-sm
            text-slate-500
          "
          >
            Upload a clear photo or scan
          </p>

          <span
            className="
            mt-4
            rounded-lg
            border
            border-white/10
            bg-white/[0.03]
            px-3
            py-1.5
            text-xs
            text-slate-500
          "
          >
            JPG, PNG, WEBP
          </span>
        </div>
      )}

      <input
        type="file"
        accept="
          image/png,
          image/jpeg,
          image/jpg,
          image/webp
        "
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

/* ============================================================
   PRIMARY BUTTON
============================================================ */

function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  loadingText,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        mt-5
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-gradient-to-r
        from-violet-600
        to-fuchsia-500
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        shadow-lg
        shadow-violet-900/20
        transition
        hover:brightness-110
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      {loading ? (
        <>
          <span
            className="
            h-4
            w-4
            animate-spin
            rounded-full
            border-2
            border-white/30
            border-t-white
          "
          />

          {loadingText}
        </>
      ) : (
        <>
          {icon}

          {children}

          <ChevronRight size={16} />
        </>
      )}
    </button>
  );
}

/* ============================================================
   SECONDARY BUTTON
============================================================ */

function SecondaryButton({ children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="
        mx-auto
        mt-4
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-white/10
        bg-white/[0.02]
        px-5
        py-3
        text-sm
        font-medium
        text-slate-400
        transition
        hover:bg-white/[0.05]
        hover:text-slate-200
      "
    >
      {icon}
      {children}
    </button>
  );
}

/* ============================================================
   RESULT
============================================================ */

function QuizResult({ result }) {
  const total = Number(result.total || 0);
  const score = Number(result.score || 0);
  const percentage = Number(result.percentage || 0);

  return (
    <section
      className="
      rounded-3xl
      border
      border-white/10
      bg-[#0c101b]
      p-5
      shadow-2xl
      shadow-black/20
      sm:p-7
    "
    >
      <div className="text-center">
        <div
          className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-violet-600/10
          text-violet-300
        "
        >
          <ClipboardCheck size={23} />
        </div>

        <p
          className="
          mt-4
          text-xs
          font-medium
          uppercase
          tracking-widest
          text-slate-500
        "
        >
          Quiz Result
        </p>

        <div
          className="
          mt-2
          text-5xl
          font-semibold
          tracking-tight
        "
        >
          {formatNumber(score)}

          <span
            className="
            text-2xl
            text-slate-600
          "
          >
            {" "}
            / {formatNumber(total)}
          </span>
        </div>

        <p
          className="
          mt-2
          text-xl
          font-semibold
          text-violet-300
        "
        >
          {formatNumber(percentage)}%
        </p>
      </div>

      {/* STATS */}

      <div
        className="
        mx-auto
        mt-8
        grid
        max-w-2xl
        grid-cols-3
        gap-3
      "
      >
        <ResultStat
          label="Correct"
          value={result.correct}
          icon={<CheckCircle2 size={16} />}
          className="text-emerald-400"
        />

        <ResultStat
          label="Wrong"
          value={result.wrong}
          icon={<AlertTriangle size={16} />}
          className="text-red-400"
        />

        <ResultStat
          label="Review"
          value={result.needs_review}
          icon={<AlertTriangle size={16} />}
          className="text-amber-400"
        />
      </div>

      {/* RESULTS */}

      <div
        className="
        mt-8
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
      "
      >
        <div
          className="
          hidden
          grid-cols-5
          gap-2
          border-b
          border-white/[0.07]
          bg-white/[0.02]
          p-3
          text-[10px]
          font-semibold
          uppercase
          tracking-wider
          text-slate-600
          sm:grid
        "
        >
          <span>Question</span>
          <span>Type</span>
          <span>Student</span>
          <span>Correct</span>
          <span>Result</span>
        </div>

        {(result.results || []).map((item) => (
          <div
            key={item.question}
            className="
              grid
              gap-3
              border-b
              border-white/[0.06]
              p-4
              last:border-b-0
              sm:grid-cols-5
              sm:items-center
              sm:gap-2
            "
          >
            <div
              className="
              flex
              items-center
              justify-between
              sm:block
            "
            >
              <span
                className="
                text-xs
                text-slate-500
                sm:hidden
              "
              >
                Question
              </span>

              <span
                className="
                text-sm
                font-medium
                text-slate-300
              "
              >
                #{item.question}
              </span>
            </div>

            <div
              className="
              flex
              items-center
              justify-between
              sm:block
            "
            >
              <span
                className="
                text-xs
                text-slate-500
                sm:hidden
              "
              >
                Type
              </span>

              <span
                className="
                text-xs
                text-slate-500
              "
              >
                Multiple Choice
              </span>
            </div>

            <div
              className="
              flex
              items-center
              justify-between
              sm:block
            "
            >
              <span
                className="
                text-xs
                text-slate-500
                sm:hidden
              "
              >
                Student
              </span>

              <span
                className="
                text-sm
                font-medium
                text-slate-300
              "
              >
                {item.student_answer || "—"}
              </span>
            </div>

            <div
              className="
              flex
              items-center
              justify-between
              sm:block
            "
            >
              <span
                className="
                text-xs
                text-slate-500
                sm:hidden
              "
              >
                Correct
              </span>

              <span
                className="
                text-sm
                font-medium
                text-slate-300
              "
              >
                {item.correct_answer || "—"}
              </span>
            </div>

            <div
              className="
              flex
              items-center
              justify-between
              sm:block
            "
            >
              <span
                className="
                text-xs
                text-slate-500
                sm:hidden
              "
              >
                Result
              </span>

              <ResultBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   RESULT STAT
============================================================ */

function ResultStat({ label, value, icon, className }) {
  return (
    <div
      className="
      rounded-2xl
      border
      border-white/[0.07]
      bg-white/[0.015]
      p-4
      text-center
    "
    >
      <div
        className={`
        mx-auto
        flex
        w-fit
        ${className}
      `}
      >
        {icon}
      </div>

      <p
        className="
        mt-2
        text-2xl
        font-semibold
        text-slate-200
      "
      >
        {value ?? 0}
      </p>

      <p
        className="
        text-xs
        text-slate-600
      "
      >
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   RESULT BADGE
============================================================ */

function ResultBadge({ status }) {
  if (status === "correct") {
    return (
      <span
        className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-emerald-500/10
        px-2.5
        py-1
        text-xs
        text-emerald-400
      "
      >
        <CheckCircle2 size={13} />
        Correct
      </span>
    );
  }

  if (status === "incorrect") {
    return (
      <span
        className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-red-500/10
        px-2.5
        py-1
        text-xs
        text-red-400
      "
      >
        <AlertTriangle size={13} />
        Wrong
      </span>
    );
  }

  return (
    <span
      className="
      inline-flex
      items-center
      gap-1.5
      rounded-full
      bg-amber-500/10
      px-2.5
      py-1
      text-xs
      text-amber-400
    "
    >
      <AlertTriangle size={13} />
      Review
    </span>
  );
}

/* ============================================================
   FORMAT NUMBER
============================================================ */

function formatNumber(value) {
  const number = Number(value);

  return Number.isInteger(number) ? number : number.toFixed(2);
}
