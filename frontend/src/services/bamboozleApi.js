const API_URL = "http://127.0.0.1:8000/api";

export async function generateBamboozleQuestions(grade, subject) {
  const response = await fetch(`${API_URL}/bamboozle/generate`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      grade,
      subject,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail || "Failed to generate Bamboozle questions.",
    );
  }

  return response.json();
}
