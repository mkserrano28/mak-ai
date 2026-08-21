import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileOutput,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CONVERSION_OPTIONS = [
  {
    format: "pdf",
    label: "PDF",
    description: "Portable Document",
  },
  {
    format: "docx",
    label: "Word",
    description: "DOC / DOCX",
  },
  {
    format: "txt",
    label: "Text",
    description: "Plain text",
  },
  {
    format: "pptx",
    label: "PowerPoint",
    description: "PPT / PPTX",
  },
];

function getExtension(filename = "") {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index + 1).toLowerCase() : "";
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatName(format) {
  const labels = {
    docx: "Word",
    doc: "Word",
    pptx: "PowerPoint",
    ppt: "PowerPoint",
    pdf: "PDF",
    txt: "Text",
  };

  return labels[format] || format.toUpperCase();
}

export default function FileConverter() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(null);
  const [error, setError] = useState("");

  const inputFormat = useMemo(
    () => (file ? getExtension(file.name) : ""),
    [file],
  );

  useEffect(() => {
    setTargetFormat("");
    setError("");
    setConverted(null);
  }, [file]);

  const selectFile = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (!getExtension(selected.name)) {
      setError("Please upload a file with a file extension.");
      return;
    }

    setFile(selected);
    setConverted(null);
    setError("");

    // Allow selecting the same file again later.
    event.target.value = "";
  };

  const convert = async () => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }

    if (!targetFormat) {
      setError("Please choose the output format.");
      return;
    }

    setLoading(true);
    setConverted(null);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("target_format", targetFormat);

      const response = await fetch(
        `${API_BASE_URL}/api/file-converter/convert`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        let message = "File conversion failed.";

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          // Keep fallback message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const disposition = response.headers.get("content-disposition");

      const filename =
        extractFilename(disposition) ||
        `${file.name.replace(/\.[^/.]+$/, "")}.${targetFormat}`;

      setConverted({
        url,
        filename,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "File conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (converted?.url) {
      URL.revokeObjectURL(converted.url);
    }

    setFile(null);
    setTargetFormat("");
    setConverted(null);
    setError("");
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080b14] px-4 py-10 text-slate-100 sm:px-6">
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
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-300">
            <FileOutput size={23} />
          </div>

          <h1 className="text-3xl font-medium tracking-tight">
            File Converter
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Convert between Word, PDF, Text, and PowerPoint.
          </p>
        </div>

        <section className="w-full rounded-3xl border border-white/10 bg-[#0c101b] p-5 shadow-2xl shadow-black/20 sm:p-7">
          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-red-300/70 hover:text-red-200"
                aria-label="Close error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <label className="group block cursor-pointer rounded-2xl border border-dashed border-slate-700 bg-[#080b14] p-8 text-center transition hover:border-violet-500/50 hover:bg-violet-500/[0.02]">
            {file ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-300">
                  <FileText size={25} />
                </div>

                <p className="mx-auto mt-4 max-w-md truncate text-sm font-medium text-slate-200">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {formatSize(file.size)} · {inputFormat.toUpperCase()}
                </p>

                <span className="mt-4 inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-500">
                  Choose another file
                </span>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-300 transition group-hover:scale-105">
                  <Upload size={24} />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-200">
                  Drop a file here or click to upload
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Word · PDF · TXT · PowerPoint · Up to 100 MB
                </p>
              </>
            )}

            <input type="file" onChange={selectFile} className="hidden" />
          </label>

          {file && (
            <div className="mt-7">
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Convert this file to
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Choose Word, PDF, Text, or PowerPoint.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CONVERSION_OPTIONS.map((item) => {
                  const active = targetFormat === item.format;

                  // Treat DOC/DOCX as Word and PPT/PPTX as PowerPoint.
                  const sameFormat =
                    (item.format === "docx" &&
                      ["doc", "docx"].includes(inputFormat)) ||
                    (item.format === "pptx" &&
                      ["ppt", "pptx"].includes(inputFormat)) ||
                    item.format === inputFormat;

                  return (
                    <button
                      key={item.format}
                      type="button"
                      disabled={sameFormat}
                      onClick={() => {
                        setTargetFormat(item.format);
                        setError("");
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-violet-500/50 bg-violet-500/10"
                          : sameFormat
                            ? "cursor-not-allowed border-white/[0.05] bg-white/[0.01] opacity-35"
                            : "border-white/[0.07] bg-white/[0.015] hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          active ? "text-violet-300" : "text-slate-200"
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {targetFormat && (
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Selected conversion
                    </p>

                    <p className="mt-1 text-sm font-medium text-violet-300">
                      {formatName(inputFormat)}{" "}
                      <span className="text-violet-500">→</span>{" "}
                      {formatName(targetFormat)}
                    </p>
                  </div>

                  <ArrowRight size={18} className="text-violet-400" />
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={convert}
            disabled={!file || !targetFormat || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert File
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {converted && (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={19} className="text-emerald-400" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    Conversion complete
                  </p>

                  <p className="truncate text-xs text-slate-600">
                    {converted.filename}
                  </p>
                </div>

                <a
                  href={converted.url}
                  download={converted.filename}
                  className="rounded-lg border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-300"
        >
          Start Over
        </button>

        <p className="mt-4 text-center text-[11px] text-slate-600">
          Files are processed temporarily and are not saved to a database.
        </p>
      </div>
    </div>
  );
}

function extractFilename(contentDisposition) {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/^["']|["']$/g, ""));
    } catch {
      return utf8Match[1];
    }
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] || null;
}
