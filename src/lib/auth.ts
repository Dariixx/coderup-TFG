import type { User } from "./types";
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./utils";
import { API_ENDPOINTS, apiFetch, setApiAuthToken } from "./api";

const SESSION_KEY = "coderup-session";

type AuthListener = () => void;

let currentUser: User | null = null;
let listeners: AuthListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (currentUser) {
    saveToStorage(SESSION_KEY, currentUser);
  } else {
    removeFromStorage(SESSION_KEY);
  }
}

function backendUserToLocal(data: any): User {
  const user = data?.user ?? data;

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role ?? "client",
    isNewUser: false,
    usedWelcomeCoupon: false,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

function storeBackendSession(data: any) {
  if (data?.token) {
    setApiAuthToken(data.token);
  }

  return backendUserToLocal(data);
}

export function initAuth() {
  currentUser = loadFromStorage<User | null>(SESSION_KEY, null);
}

export function getCurrentUser() {
  return currentUser;
}

export function getStoredUsers() {
  return [];
}

export function syncCurrentUserFromBackend(data: any) {
  currentUser = backendUserToLocal(data);
  persist();
  notify();
  return currentUser;
}

export function subscribeAuth(listener: AuthListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) return { ok: false as const, message: "Escribe tu nombre para crear la cuenta." };
  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce un email válido, por ejemplo nombre@dominio.com." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };

  const result = await apiFetch<any>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: { name, email, password: input.password },
  });

  if (result.ok) {
    const user = storeBackendSession(result.data);
    currentUser = user;
    persist();
    notify();
    return { ok: true as const, user };
  }

  return {
    ok: false as const,
    message:
      result.message === "Error al registrar usuario"
        ? "No se ha podido crear la cuenta. Revisa los datos o inténtalo de nuevo en unos minutos."
        : result.message,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce el email con el que te registraste." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "Introduce tu contraseña. Debe tener al menos 6 caracteres." };

  const result = await apiFetch<any>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: { email, password: input.password },
  });

  if (result.ok) {
    const user = storeBackendSession(result.data);
    currentUser = user;
    persist();
    notify();
    return { ok: true as const, user };
  }

  return {
    ok: false as const,
    message:
      result.message === "Credenciales incorrectas"
        ? "Email o contraseña incorrectos. Revisa las credenciales y vuelve a intentarlo."
        : result.message,
  };
}

export async function logoutUser() {
  apiFetch(API_ENDPOINTS.auth.logout, { method: "POST" }).catch(() => {});
  setApiAuthToken(null);
  currentUser = null;
  persist();
  notify();
}

export function updateCurrentUser(patch: Partial<User>) {
  if (!currentUser) return;
  currentUser = { ...currentUser, ...patch };
  persist();
  notify();
}
