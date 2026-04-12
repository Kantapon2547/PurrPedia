const BASE = "http://127.0.0.1:8000/api";

export async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function apiFormData(path: string, formData: FormData, token?: string | null, method = "POST") {
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData,
    credentials: "omit", // 🔥 IMPORTANT (prevents old session cookies)
  });
}