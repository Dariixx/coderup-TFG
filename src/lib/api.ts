/**
 * api.ts — Configuración centralizada de la API backend
 * Todos los fetch al backend PHP pasan por aquí.
 */

// Cambia esta URL a la de tu servidor PHP local o remoto
export const API_BASE = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include", // Para cookies de sesión PHP
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      return { ok: false, message: json?.message ?? `Error ${res.status}` };
    }

    return { ok: true, data: json?.data ?? json };
  } catch (err) {
    // Backend no disponible → fallback permitido
    return { ok: false, message: "Backend no disponible" };
  }
}
