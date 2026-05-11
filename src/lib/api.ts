export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || "http://localhost/coderup-TFG/backend";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
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
    response = await fetch(`${API_BASE_URL}${path}`, {
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
  } catch {
    throw new ApiRequestError(
      "No se ha podido conectar con el backend. Revisa `PUBLIC_API_BASE_URL`, el servidor PHP y la base de datos.",
      "network",
    );
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError(
      "La respuesta del backend no es válida. Comprueba que PHP esté activo y que no haya errores fatales o avisos HTML.",
      "invalid_json",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(payload.message || `Error ${response.status}`, "http", response.status);
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

export function getApiHelpMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se ha podido completar la operación con el backend.";
}
