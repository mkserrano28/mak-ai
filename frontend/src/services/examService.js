const API_URL = "http://127.0.0.1:8000/api";

export async function generateExam(prompt) {
  const response = await fetch(`${API_URL}/exam-generator/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail || "Unable to generate exam.");
  }

  return response.json();
}

export async function downloadExam(exam) {
  const response = await fetch(`${API_URL}/exam-generator/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exam),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail || "Unable to create Word document.");
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "Mak-AI-Exam.docx";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}
