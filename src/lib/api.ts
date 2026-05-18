/**
 * api.ts — Configuración centralizada de la API backend.
 * Todos los fetch al backend PHP pasan por aquí.
 */

export const API_BASE =
  import.meta.env.PUBLIC_API_URL ??
  import.meta.env.PUBLIC_API_BASE_URL ??
  "https://coderup-tfg-production.up.railway.app";

export const API_BASE_URL = API_BASE;
const AUTH_TOKEN_KEY = "coderup-auth-token";
const CART_SESSION_KEY = "coderup-cart-session";

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

export function getApiAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setApiAuthToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function getCartSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(CART_SESSION_KEY);
  if (stored) {
    return stored;
  }

  const generated = `cart_${crypto.randomUUID().replace(/-/g, "")}`;
  window.localStorage.setItem(CART_SESSION_KEY, generated);
  return generated;
}

function setCartSessionId(sessionId: string | null) {
  if (typeof window === "undefined" || !sessionId) {
    return;
  }

  window.localStorage.setItem(CART_SESSION_KEY, sessionId);
}

async function requestApi<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  const token = getApiAuthToken();

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? options.body
            : typeof options.body === "string"
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

export async function getCourses(filters?: { category?: string; level?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.level) params.set("level", filters.level);

  const query = params.toString();
  return apiGet(query ? `/api/courses.php?${query}` : "/api/courses.php");
}

export async function getCourseDetail(slug: string) {
  return apiGet(`/api/courses/${encodeURIComponent(slug)}.php`);
}

export async function getInstructors() {
  return apiGet("/api/instructors.php");
}

export async function getInstructorDetail(id: number | string) {
  return apiGet(`/api/instructors/${encodeURIComponent(String(id))}.php`);
}

export async function getBlogPosts(page = 1) {
  return apiGet(`/api/posts.php?page=${page}`);
}

export async function getBlogPost(slug: string) {
  return apiGet(`/api/posts/${encodeURIComponent(slug)}.php`);
}

export async function validateCoupon(code: string, itemsCount: number) {
  return apiPost("/api/coupons/validate.php", { code, items_count: itemsCount });
}

export async function createOrder(cart: unknown[], couponCode?: string) {
  return apiPost("/api/orders/create.php", { cart, coupon_code: couponCode });
}

async function cartApiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  const token = getApiAuthToken();
  const cartSessionId = getCartSessionId();
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (cartSessionId) {
    headers.set("X-CoderUp-Cart-Session", cartSessionId);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? options.body
          : typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body),
  });

  setCartSessionId(response.headers.get("X-CoderUp-Cart-Session"));

  const payload = await response.json();
  const success = payload?.success ?? payload?.ok ?? response.ok;

  return {
    ok: Boolean(success),
    success: Boolean(success),
    message: payload?.message ?? (response.ok ? "Success" : `Error ${response.status}`),
    data: payload?.data ?? payload,
  };
}

export async function getCart() {
  return cartApiRequest<any>("/api/cart.php", { method: "GET" });
}

export async function addToCart(courseId: number | string) {
  return cartApiRequest<any>("/api/cart.php", {
    method: "POST",
    body: { course_id: Number(courseId) },
  });
}

export async function removeFromCart(itemId: number | string) {
  return cartApiRequest<any>(`/api/cart.php?item_id=${encodeURIComponent(String(itemId))}`, {
    method: "DELETE",
  });
}

export async function checkout(couponCode?: string | null) {
  return cartApiRequest<any>("/api/cart/checkout.php", {
    method: "POST",
    body: { coupon_code: couponCode || null },
  });
}

export async function getOrders(page = 1) {
  return cartApiRequest<any>(`/api/orders.php?page=${encodeURIComponent(String(page))}`, {
    method: "GET",
  });
}
