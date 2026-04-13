const BASE = "http://127.0.0.1:8000/api";

/**
 * Safe API fetch (JSON)
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  const accessToken = token || localStorage.getItem("pp_token");

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Safe FormData API
 */
export async function apiFormData(
  path: string,
  formData: FormData,
  token?: string | null,
  method = "POST"
) {
  const headers: Record<string, string> = {};

  const accessToken = token || localStorage.getItem("pp_token");

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData,
  });
}