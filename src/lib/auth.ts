/**
 * auth.ts — Autenticación con backend PHP real + fallback a localStorage.
 *
 * Flujo:
 *  1. Intenta POST /auth/login.php o /auth/register.php en el backend.
 *  2. Si el backend responde OK → usa esos datos.
 *  3. Si el backend no está disponible → fallback a localStorage (modo demo).
 */

import type { StoredUser, User } from "./types";
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./utils";
import { apiFetch, setApiAuthToken } from "./api";

const USERS_KEY = "coderup-users";
const SESSION_KEY = "coderup-session";

type AuthListener = () => void;

let users: StoredUser[] = [];
let currentUser: User | null = null;
let listeners: AuthListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function sanitizeUser(user: StoredUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function persist() {
  saveToStorage(USERS_KEY, users);
  if (currentUser) {
    saveToStorage(SESSION_KEY, currentUser);
  } else {
    removeFromStorage(SESSION_KEY);
  }
}

/** Convierte la respuesta del backend PHP al tipo User local */
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
  users = loadFromStorage<StoredUser[]>(USERS_KEY, []);
  currentUser = loadFromStorage<User | null>(SESSION_KEY, null);
}

export function getCurrentUser() {
  return currentUser;
}

export function getStoredUsers() {
  return users;
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

/* ─── REGISTER ─────────────────────────────────────────────────────────── */

export async function registerUser(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  // Validaciones cliente
  if (!name) return { ok: false as const, message: "El nombre es obligatorio." };
  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce un email válido." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };

  // ── Intento backend real ──
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

  // Si el error es de negocio (email duplicado), lo devolvemos directamente
  if (!result.message.includes("Backend no disponible")) {
    return { ok: false as const, message: result.message };
  }

  // ── Fallback localStorage ──
  if (users.some((u) => u.email === email)) {
    return { ok: false as const, message: "Ya existe una cuenta con este email." };
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  const nextUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: input.password,
    role: "client",
    isNewUser: true,
    usedWelcomeCoupon: false,
    createdAt: new Date().toISOString(),
  };

  users = [...users, nextUser];
  currentUser = sanitizeUser(nextUser);
  persist();
  notify();

  return { ok: true as const, user: currentUser };
}

/* ─── LOGIN ─────────────────────────────────────────────────────────────── */

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Introduce un email válido." };
  if (!PASSWORD_REGEX.test(input.password))
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };

  // ── Intento backend real ──
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

  if (!result.message.includes("Backend no disponible")) {
    return { ok: false as const, message: result.message };
  }

  // ── Fallback localStorage ──
  await new Promise((resolve) => setTimeout(resolve, 800));

  const match = users.find((u) => u.email === email && u.password === input.password);
  if (!match) return { ok: false as const, message: "Credenciales incorrectas." };

  currentUser = sanitizeUser(match);
  persist();
  notify();

  return { ok: true as const, user: currentUser };
}

/* ─── LOGOUT ────────────────────────────────────────────────────────────── */

export async function logoutUser() {
  // Intentar invalidar sesión en backend (sin bloquear si falla)
  apiFetch("/auth/logout.php", { method: "POST" }).catch(() => {});
  setApiAuthToken(null);
  currentUser = null;
  persist();
  notify();
}

export function updateCurrentUser(patch: Partial<User>) {
  if (!currentUser) return;
  currentUser = { ...currentUser, ...patch };
  users = users.map((u) => (u.id === currentUser?.id ? { ...u, ...patch } : u));
  persist();
  notify();
}
