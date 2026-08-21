import { useState } from "react";
import {
  Upload,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ScanSearch,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function QuizChecker() {
  const navigate = useNavigate();
  const [quizImage, setQuizImage] = useState(null);
  const [quizPreview, setQuizPreview] = useState(null);
  const [studentImage, setStudentImage] = useState(null);
  const [studentPreview, setStudentPreview] = useState(null);

  const [answerKey, setAnswerKey] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "quiz") {
      setQuizImage(file);
      setQuizPreview(preview);
      setAnswerKey(null);
      setResult(null);
    } else {
      setStudentImage(file);
      setStudentPreview(preview);
      setResult(null);
    }

    setError("");
  };

  const generateAnswerKey = async () => {
    if (!quizImage) {
      setError("Upload the quiz paper first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswerKey(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", quizImage);

      const response = await fetch(
        `${API_BASE_URL}/api/quiz/generate-answer-key`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to generate the answer key.");
      }

      setAnswerKey(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const checkStudentQuiz = async () => {
    if (!answerKey) {
      setError("Generate the answer key first.");
      return;
    }

    if (!studentImage) {
      setError("Upload the student's completed paper.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("answer_key", JSON.stringify(answerKey.questions));
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
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuizImage(null);
    setQuizPreview(null);
    setStudentImage(null);
    setStudentPreview(null);
    setAnswerKey(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
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
                hover:bg-slate-800
                hover:text-white
            "
      >
        ← Back to Dashboard
      </button>
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            <Sparkles size={14} />
            Mak-AI Education
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Quiz Checker
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Scan a quiz paper, let Mak-AI generate the answer key, then check a
            student's completed paper automatically.
          </p>
        </header>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <StepPill
            number="1"
            label="Quiz Paper"
            active={!answerKey && !result}
            complete={Boolean(answerKey)}
          />
          <ChevronRight size={14} className="text-slate-600" />
          <StepPill
            number="2"
            label="Answer Key"
            active={Boolean(answerKey) && !result}
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

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 */}
        {!answerKey && !result && (
          <section className="rounded-3xl border border-white/10 bg-[#0c101b] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-300">
                <ScanSearch size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Upload your quiz paper
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mak-AI will read the questions and generate the answer key. No
                  manual answer entry required.
                </p>
              </div>
            </div>

            <UploadCard
              preview={quizPreview}
              file={quizImage}
              label="Quiz / Question Paper"
              description="Upload a clear photo or scan"
              onChange={(e) => handleFile(e, "quiz")}
            />

            <PrimaryButton
              onClick={generateAnswerKey}
              disabled={!quizImage || loading}
              loading={loading}
              loadingText="Mak-AI is reading the quiz..."
              icon={<Sparkles size={17} />}
            >
              Generate Answer Key
            </PrimaryButton>
          </section>
        )}

        {/* STEP 2 */}
        {answerKey && !result && (
          <>
            <AnswerKey answerKey={answerKey} />

            <section className="mt-5 rounded-3xl border border-white/10 bg-[#0c101b] p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-300">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Upload student's completed paper
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Mak-AI will compare the student's answers with the generated
                    answer key.
                  </p>
                </div>
              </div>

              <UploadCard
                preview={studentPreview}
                file={studentImage}
                label="Student Answer Sheet"
                description="Upload the student's completed paper"
                onChange={(e) => handleFile(e, "student")}
              />

              <PrimaryButton
                onClick={checkStudentQuiz}
                disabled={!studentImage || loading}
                loading={loading}
                loadingText="Mak-AI is checking the student..."
                icon={<ClipboardCheck size={17} />}
              >
                Check Student Quiz
              </PrimaryButton>
            </section>

            <SecondaryButton onClick={reset} icon={<RotateCcw size={16} />}>
              Start Over
            </SecondaryButton>
          </>
        )}

        {/* RESULT */}
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

function StepPill({ number, label, active, complete }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
        active
          ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
          : complete
            ? "text-emerald-400"
            : "text-slate-600"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[10px] font-semibold">
        {complete ? <CheckCircle2 size={13} /> : number}
      </span>
      <span>{label}</span>
    </div>
  );
}

function UploadCard({ preview, file, label, description, onChange }) {
  return (
    <label className="group relative block min-h-80 cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-[#080b14] transition hover:border-violet-500/60 hover:bg-violet-500/[0.02]">
      {preview ? (
        <div className="flex min-h-80 flex-col items-center justify-center p-5">
          <img
            src={preview}
            alt={label}
            className="max-h-[420px] max-w-full rounded-xl object-contain"
          />

          {file && (
            <div className="mt-4 flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
              <FileImage size={14} />
              <span className="max-w-[280px] truncate">{file.name}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-300 transition group-hover:scale-105 group-hover:bg-violet-600/15">
            <Upload size={24} />
          </div>

          <p className="font-medium text-slate-200">{label}</p>

          <p className="mt-2 text-sm text-slate-500">{description}</p>

          <span className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-500">
            JPG, PNG, WEBP
          </span>
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

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
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {children}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function SecondaryButton({ children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200"
    >
      {icon}
      {children}
    </button>
  );
}

function AnswerKey({ answerKey }) {
  const questions = answerKey.questions || {};
  const entries = Object.entries(questions);

  const reviewCount = entries.filter(
    ([, question]) => question.status === "needs_review",
  ).length;

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0c101b] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-300">
            <Sparkles size={20} />
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-violet-400">
              Generated by Mak-AI
            </div>
            <h2 className="mt-1 text-xl font-semibold">Answer Key</h2>
            <p className="mt-1 text-sm text-slate-500">
              {entries.length} questions analyzed
              {reviewCount > 0
                ? ` · ${reviewCount} needs review`
                : " · Ready to use"}
            </p>
          </div>
        </div>

        <div
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            reviewCount
              ? "bg-amber-500/10 text-amber-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {reviewCount ? `${reviewCount} Review` : "All Ready"}
        </div>
      </div>

      <div className="space-y-2">
        {entries.map(([number, question]) => (
          <AnswerKeyRow key={number} number={number} question={question} />
        ))}
      </div>
    </section>
  );
}

function AnswerKeyRow({ number, question }) {
  const needsReview = question.status === "needs_review";

  const choices =
    question.choices && typeof question.choices === "object"
      ? Object.entries(question.choices).filter(
          ([, value]) =>
            value &&
            String(value).trim() &&
            String(value).toLowerCase() !== "missing",
        )
      : [];

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        needsReview
          ? "border-amber-500/20 bg-amber-500/[0.03]"
          : "border-white/[0.07] bg-white/[0.015] hover:bg-white/[0.025]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            needsReview
              ? "bg-amber-500/10 text-amber-400"
              : "bg-violet-500/10 text-violet-300"
          }`}
        >
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-500">
              {formatQuestionType(question.type)}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] ${
                needsReview
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {needsReview ? "Needs Review" : "Ready"}
            </span>
          </div>

          <p className="text-sm leading-6 text-slate-200">
            {question.question || "Question text unavailable."}
          </p>

          {question.type === "multiple_choice" && choices.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {choices.map(([letter, value]) => {
                const correct =
                  String(question.correct_answer || "").toUpperCase() ===
                  letter.toUpperCase();

                return (
                  <div
                    key={letter}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      correct
                        ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
                        : "border-white/[0.07] text-slate-500"
                    }`}
                  >
                    <span className="mr-1.5 font-semibold">{letter}.</span>
                    {value}
                    {correct && (
                      <CheckCircle2 size={14} className="ml-2 inline" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {question.type === "true_false" && (
            <div className="mt-3 flex gap-2">
              <AnswerOption
                label="True"
                active={
                  String(question.correct_answer || "").toLowerCase() === "true"
                }
              />
              <AnswerOption
                label="False"
                active={
                  String(question.correct_answer || "").toLowerCase() ===
                  "false"
                }
              />
            </div>
          )}

          {question.type !== "multiple_choice" &&
            question.type !== "true_false" &&
            question.expected_answer && (
              <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Expected Answer
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">
                  {question.expected_answer}
                </div>
              </div>
            )}

          {question.explanation && (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {question.explanation}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] text-slate-600">
              Confidence: {question.confidence || "unknown"}
            </span>

            <span className="rounded-full border border-white/[0.07] px-2.5 py-1 text-[10px] text-slate-600">
              {question.max_score || 1}{" "}
              {Number(question.max_score) === 1 ? "point" : "points"}
            </span>
          </div>

          {needsReview && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/[0.05] p-3 text-xs leading-5 text-amber-400/80">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                {question.type === "multiple_choice" && choices.length === 0
                  ? "The answer choices are missing from the uploaded image. Upload the complete quiz page."
                  : "Mak-AI needs additional information before this question can be graded reliably."}
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-1">
          {needsReview ? (
            <AlertTriangle size={18} className="text-amber-400" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerOption({ label, active }) {
  return (
    <div
      className={`rounded-xl border px-4 py-2 text-xs ${
        active
          ? "border-emerald-500/30 bg-emerald-500/[0.06] font-semibold text-emerald-300"
          : "border-white/[0.07] text-slate-500"
      }`}
    >
      {label}
      {active && <CheckCircle2 size={13} className="ml-1.5 inline" />}
    </div>
  );
}

function QuizResult({ result }) {
  const total = Number(result.total || 0);
  const score = Number(result.score || 0);
  const percentage = Number(result.percentage || 0);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0c101b] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-300">
          <ClipboardCheck size={23} />
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          Quiz Result
        </p>

        <div className="mt-2 text-5xl font-semibold tracking-tight">
          {formatNumber(score)}
          <span className="text-2xl text-slate-600">
            {" "}
            / {formatNumber(total)}
          </span>
        </div>

        <p className="mt-2 text-xl font-semibold text-violet-300">
          {formatNumber(percentage)}%
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
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

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07]">
        <div className="hidden grid-cols-5 gap-2 border-b border-white/[0.07] bg-white/[0.02] p-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 sm:grid">
          <span>Question</span>
          <span>Type</span>
          <span>Student</span>
          <span>Correct</span>
          <span>Result</span>
        </div>

        {(result.results || []).map((item) => (
          <div
            key={item.question}
            className="grid gap-3 border-b border-white/[0.06] p-4 last:border-b-0 sm:grid-cols-5 sm:items-center sm:gap-2"
          >
            <div className="flex items-center justify-between sm:block">
              <span className="text-xs text-slate-500 sm:hidden">Question</span>
              <span className="text-sm font-medium text-slate-300">
                #{item.question}
              </span>
            </div>

            <div className="flex items-center justify-between sm:block">
              <span className="text-xs text-slate-500 sm:hidden">Type</span>
              <span className="text-xs text-slate-500">
                {formatQuestionType(item.type)}
              </span>
            </div>

            <div className="flex items-center justify-between sm:block">
              <span className="text-xs text-slate-500 sm:hidden">Student</span>
              <span className="text-sm text-slate-300">
                {item.student_answer || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between sm:block">
              <span className="text-xs text-slate-500 sm:hidden">Correct</span>
              <span className="text-sm text-slate-300">
                {item.correct_answer || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between sm:block">
              <span className="text-xs text-slate-500 sm:hidden">Result</span>
              <ResultBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultStat({ label, value, icon, className }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 text-center">
      <div className={`mx-auto flex w-fit ${className}`}>{icon}</div>
      <p className="mt-2 text-2xl font-semibold text-slate-200">{value}</p>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}

function ResultBadge({ status }) {
  if (status === "correct") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
        <CheckCircle2 size={13} />
        Correct
      </span>
    );
  }

  if (status === "incorrect") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
        <AlertTriangle size={13} />
        Wrong
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
      <AlertTriangle size={13} />
      Review
    </span>
  );
}

function formatQuestionType(type) {
  const labels = {
    multiple_choice: "Multiple Choice",
    true_false: "True / False",
    fill_blank: "Fill in the Blank",
    short_answer: "Short Answer",
    math: "Math",
    essay: "Essay",
    unknown: "Unknown",
  };

  return labels[type] || "Unknown";
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : number.toFixed(2);
}
