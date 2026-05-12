/**
 * api.ts — Configuración centralizada de la API backend.
 * Todos los fetch al backend PHP pasan por aquí.
 */

export const API_BASE =
  import.meta.env.PUBLIC_API_URL ??
  import.meta.env.PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export const API_BASE_URL = API_BASE;

export interface ApiResponse<T = unknown> {
  ok: boolean;
  success: boolean;
  message: string;
  data: T;
}

export class ApiRequestError extends Error {
  status?: number;
  code: "network" | "invalid_json" | "http";

  constructor(message: string, code: "network" | "invalid_json" | "http", status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? options.body
            : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiRequestError(
      "No se ha podido conectar con el backend. Revisa la URL de la API, el servidor PHP y la base de datos.",
      "network",
    );
  }

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError(
      "La respuesta del backend no es válida. Comprueba que PHP esté activo y no haya errores HTML.",
      "invalid_json",
      response.status,
    );
  }

  const success = payload?.success ?? payload?.ok ?? response.ok;
  const message = payload?.message ?? (response.ok ? "Success" : `Error ${response.status}`);

  if (!response.ok || !success) {
    throw new ApiRequestError(message, "http", response.status);
  }

  return {
    ok: Boolean(success),
    success: Boolean(success),
    message,
    data: payload?.data ?? payload,
  };
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const response = await requestApi<T>(path, options);
    return { ok: true, data: response.data };
  } catch (error) {
    return { ok: false, message: getApiHelpMessage(error) };
  }
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

export function getApiHelpMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se ha podido completar la operación con el backend.";
}
