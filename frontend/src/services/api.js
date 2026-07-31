const API_URL = "http://127.0.0.1:8000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("makai_access_token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("makai_access_token");
    localStorage.removeItem("makai_user");

    window.location.href = "/login";

    throw new Error("Session expired.");
  }

  return response;
}

export { API_URL };
