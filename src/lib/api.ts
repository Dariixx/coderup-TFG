export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost/coderup-TFG/backend";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function requestApi<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || `Error ${response.status}`);
  }

  return payload;
}

export function apiGet<T>(path: string) {
  return requestApi<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown) {
  return requestApi<T>(path, { method: "POST", body });
}

export function apiPut<T>(path: string, body?: unknown) {
  return requestApi<T>(path, { method: "PUT", body });
}

export function apiDelete<T>(path: string, body?: unknown) {
  return requestApi<T>(path, { method: "DELETE", body });
}
