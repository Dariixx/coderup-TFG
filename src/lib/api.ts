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

export const API_ENDPOINTS = {
  auth: {
    me: "/auth/me.php",
    login: "/auth/login.php",
    register: "/auth/register.php",
    logout: "/auth/logout.php",
    changePassword: "/auth/change-password.php",
    forgotPassword: "/auth/forgot-password.php",
    resetPassword: "/auth/reset-password.php",
  },
  courses: {
    list: "/api/courses.php",
    detail: "/api/courses/show.php",
  },
  instructors: {
    list: "/api/instructors.php",
    detail: "/api/instructors/show.php",
  },
  posts: {
    list: "/api/posts.php",
    detail: "/api/posts/show.php",
  },
  cart: {
    root: "/api/cart.php",
    checkout: "/api/cart/checkout.php",
  },
  coupons: {
    validate: "/api/coupons/validate.php",
  },
  orders: {
    list: "/api/orders.php",
    create: "/api/orders/create.php",
  },
  enrollments: {
    root: "/api/enrollments.php",
  },
  users: {
    updateProfile: "/users/update-profile.php",
  },
  githubProjects: "/api/github-projects.php",
} as const;

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

function normalizeBackendMessage(message: string, status?: number) {
  const normalized = message.trim();

  if (status === 401 || /unauthorized|no autenticado/i.test(normalized)) {
    return "Tu sesión no está activa. Inicia sesión de nuevo para continuar.";
  }

  if (status === 403 || /forbidden/i.test(normalized)) {
    return "No tienes permisos suficientes para realizar esta acción con tu rol actual.";
  }

  if (/validation failed/i.test(normalized)) {
    return "Faltan datos obligatorios o hay campos con formato incorrecto. Revisa el formulario antes de enviarlo.";
  }

  if (/method not allowed|method .* required/i.test(normalized)) {
    return "La operación no coincide con el método esperado por la API. Actualiza la página e inténtalo de nuevo.";
  }

  if (/internal_server_error|error interno/i.test(normalized)) {
    return "El backend ha encontrado un problema interno. Inténtalo de nuevo en unos minutos o revisa los logs del servidor.";
  }

  if (!normalized || /^error \d+$/i.test(normalized)) {
    return status
      ? `La API ha respondido con estado ${status}. Revisa la conexión, la sesión y vuelve a intentarlo.`
      : "La API no ha devuelto un mensaje de error. Revisa la conexión con Railway y vuelve a intentarlo.";
  }

  return normalized;
}

export function withQuery(path: string, params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
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
      "No se ha podido conectar con la API. Comprueba tu conexión, que Railway esté activo y que PUBLIC_API_URL apunte al backend correcto.",
      "network",
    );
  }

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError(
      "La API ha respondido con un formato que no es JSON. Revisa errores PHP, CORS o una URL de backend incorrecta.",
      "invalid_json",
      response.status,
    );
  }

  const success = payload?.success ?? payload?.ok ?? response.ok;
  const message = normalizeBackendMessage(payload?.message ?? (response.ok ? "Success" : `Error ${response.status}`), response.status);

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
): Promise<{ ok: true; data: T; message: string } | { ok: false; message: string }> {
  try {
    const response = await requestApi<T>(path, options);
    return { ok: true, data: response.data, message: response.message };
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
    return normalizeBackendMessage(error.message, error.status);
  }

  if (error instanceof Error) {
    return normalizeBackendMessage(error.message);
  }

  return "La API no ha devuelto detalles del fallo. Revisa la conexión con Railway y vuelve a intentarlo.";
}

export async function getCourses(filters?: { category?: string; level?: string }) {
  return apiGet(withQuery(API_ENDPOINTS.courses.list, filters ?? {}));
}

export async function getCourseDetail(slug: string) {
  return apiGet(withQuery(API_ENDPOINTS.courses.detail, { slug }));
}

export async function getInstructors() {
  return apiGet(API_ENDPOINTS.instructors.list);
}

export async function getInstructorDetail(id: number | string) {
  const key = /^\d+$/.test(String(id)) ? "id" : "slug";
  return apiGet(withQuery(API_ENDPOINTS.instructors.detail, { [key]: id }));
}

export async function getBlogPosts(page = 1) {
  return apiGet(withQuery(API_ENDPOINTS.posts.list, { page }));
}

export async function getBlogPost(slug: string) {
  return apiGet(withQuery(API_ENDPOINTS.posts.detail, { slug }));
}

export async function validateCoupon(code: string, itemsCount: number) {
  return apiPost(API_ENDPOINTS.coupons.validate, { code, items_count: itemsCount });
}

export async function createOrder(cart: unknown[], couponCode?: string) {
  return apiPost(API_ENDPOINTS.orders.create, { cart, coupon_code: couponCode });
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
            : typeof options.body === "string"
              ? options.body
              : JSON.stringify(options.body),
    });
  } catch {
    return {
      ok: false,
      success: false,
      message: "No se ha podido conectar con la API del carrito. Comprueba la conexión y vuelve a intentarlo.",
      data: null as T,
    };
  }

  setCartSessionId(response.headers.get("X-CoderUp-Cart-Session"));

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      success: false,
      message: "La API del carrito no ha devuelto JSON válido. Revisa el backend PHP o la URL configurada.",
      data: null as T,
    };
  }

  const success = payload?.success ?? payload?.ok ?? response.ok;
  const message = normalizeBackendMessage(payload?.message ?? (response.ok ? "Success" : `Error ${response.status}`), response.status);

  return {
    ok: Boolean(success),
    success: Boolean(success),
    message,
    data: payload?.data ?? payload,
  };
}

export async function getCart() {
  return cartApiRequest<any>(API_ENDPOINTS.cart.root, { method: "GET" });
}

export async function addToCart(courseId: number | string) {
  return cartApiRequest<any>(API_ENDPOINTS.cart.root, {
    method: "POST",
    body: { course_id: Number(courseId) },
  });
}

export async function removeFromCart(itemId: number | string) {
  return cartApiRequest<any>(withQuery(API_ENDPOINTS.cart.root, { item_id: itemId }), {
    method: "DELETE",
  });
}

export async function checkout(couponCode?: string | null) {
  return cartApiRequest<any>(API_ENDPOINTS.cart.checkout, {
    method: "POST",
    body: { coupon_code: couponCode || null },
  });
}

export async function getOrders(page = 1) {
  return cartApiRequest<any>(withQuery(API_ENDPOINTS.orders.list, { page }), {
    method: "GET",
  });
}

export async function getEnrollments() {
  return apiGet<any>(API_ENDPOINTS.enrollments.root);
}

export async function createEnrollment(courseId: number | string) {
  return apiPost<any>(API_ENDPOINTS.enrollments.root, { course_id: Number(courseId) });
}

export async function updateEnrollment(enrollmentId: number | string, progress: number) {
  return apiPut<any>(API_ENDPOINTS.enrollments.root, { enrollment_id: Number(enrollmentId), progress });
}

export async function getGithubProjects() {
  return apiGet<any>(API_ENDPOINTS.githubProjects);
}
