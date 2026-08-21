import { useState } from "react";
import { generateExam, downloadExam } from "../services/examService";
import { useNavigate } from "react-router-dom";

export default function ExamGenerator() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);

  const [loading, setLoading] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setExam(null);

    try {
      const result = await generateExam(prompt);

      setExam(result);
    } catch (err) {
      setError(err.message || "Unable to generate exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!exam) return;

    setDownloading(true);

    try {
      await downloadExam(exam);
    } catch (err) {
      setError(err.message || "Unable to download Word file.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="text-4xl"></div>

            <div>
              <h1 className="text-3xl font-bold">Exam Generator</h1>

              <p className="text-slate-400 mt-1">
                Create classroom-ready exams with Mak-AI
              </p>
            </div>
          </div>
        </div>

        {/* Prompt */}

        <div
          className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-6
        "
        >
          <label
            className="
            block
            text-sm
            font-medium
            text-slate-300
            mb-3
          "
          >
            What exam would you like to create?
          </label>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={
              "Example: Create a 50-item Grade 10 Mathematics exam covering quadratic equations, functions, and geometry. Include an answer key."
            }
            rows={6}
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-4
              text-white
              outline-none
              resize-none
              placeholder:text-slate-600
              focus:border-purple-500
            "
          />

          <div
            className="
            flex
            justify-end
            mt-4
          "
          >
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="
                rounded-xl
                bg-gradient-to-r
                from-[#5B4CFF]
                via-[#7C3AED]
                to-[#A855F7]
                px-6
                py-3
                font-semibold
                hover:brightness-110
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {loading ? " Creating Exam..." : " Generate Exam"}
            </button>
          </div>

          {error && (
            <div
              className="
              mt-4
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              p-4
              text-sm
              text-red-300
            "
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Preview */}

        {exam && (
          <div className="mt-8">
            <div
              className="
              flex
              items-center
              justify-between
              mb-4
            "
            >
              <h2 className="text-xl font-bold">Exam Preview</h2>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="
                  rounded-xl
                  bg-green-600
                  px-5
                  py-2.5
                  font-semibold
                  hover:bg-green-500
                  disabled:opacity-50
                "
              >
                {downloading ? "Preparing..." : "📥 Download Word"}
              </button>
            </div>

            <div
              className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-8
            "
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">{exam.title}</h2>

                <p
                  className="
                  text-slate-400
                  mt-3
                "
                >
                  {exam.instructions}
                </p>
              </div>

              <div
                className="
                border-b
                border-slate-800
                pb-5
                mb-6
              "
              >
                <p className="text-sm text-slate-400">
                  Name:
                  <span className="ml-2 text-white">
                    ______________________________
                  </span>
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  Section:
                  <span className="ml-2 text-white">
                    ______________________________
                  </span>
                </p>
              </div>

              <div className="space-y-7">
                {exam.questions.map((question, index) => (
                  <div key={question.number || index}>
                    <p
                      className="
                        font-medium
                        leading-relaxed
                      "
                    >
                      {question.number || index + 1}. {question.question}
                    </p>

                    <div
                      className="
                        mt-3
                        ml-4
                        space-y-2
                        text-sm
                        text-slate-300
                      "
                    >
                      {["A", "B", "C", "D"].map((letter) => (
                        <p key={letter}>
                          <span className="font-medium">{letter}.</span>{" "}
                          {question.choices?.[letter]}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
