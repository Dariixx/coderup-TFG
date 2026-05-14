import type { User } from "./types";
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./utils";
import { apiFetch, setApiAuthToken } from "./api";

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

  if (!name) return { ok: false as const, message: "El nombre es obligatorio." };
  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce un email válido." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };

  const result = await apiFetch<any>("/auth/register.php", {
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

  return { ok: false as const, message: result.message };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce un email válido." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };

  const result = await apiFetch<any>("/auth/login.php", {
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

  return { ok: false as const, message: result.message };
}

export async function logoutUser() {
  apiFetch("/auth/logout.php", { method: "POST" }).catch(() => {});
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
