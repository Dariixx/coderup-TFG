import { apiGet, apiPost } from "./api";
import { removeFromStorage, saveToStorage } from "./storage";
import type { User } from "./types";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./utils";

const SESSION_KEY = "coderup-session";

type AuthListener = () => void;

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number;
  created_at?: string | null;
}

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

function mapApiUser(user: ApiUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    roleId: user.role_id,
    createdAt: user.created_at ?? null,
  };
}

export async function initAuth() {
  try {
    const response = await apiGet<{ user: ApiUser }>("/auth/me.php");
    const user = response.data?.user;
    currentUser = user ? mapApiUser(user) : null;
  } catch {
    currentUser = null;
  }

  persist();
  notify();
}

export function getCurrentUser() {
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

  if (!name) {
    return { ok: false as const, message: "El nombre es obligatorio." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false as const, message: "Introduce un email válido." };
  }

  if (!PASSWORD_REGEX.test(input.password)) {
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const response = await apiPost<{ user: ApiUser }>("/auth/register.php", {
      name,
      email,
      password: input.password,
    });
    const user = response.data?.user;

    if (!user) {
      return { ok: false as const, message: "No se ha recibido el usuario creado." };
    }

    currentUser = mapApiUser(user);
    persist();
    notify();

    return { ok: true as const, user: currentUser };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "No se ha podido completar el registro." };
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false as const, message: "Introduce un email válido." };
  }

  if (!PASSWORD_REGEX.test(input.password)) {
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const response = await apiPost<{ user: ApiUser }>("/auth/login.php", {
      email,
      password: input.password,
    });
    const user = response.data?.user;

    if (!user) {
      return { ok: false as const, message: "No se ha recibido la sesión del usuario." };
    }

    currentUser = mapApiUser(user);
    persist();
    notify();

    return { ok: true as const, user: currentUser };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "No se ha podido iniciar sesión." };
  }
}

export async function logoutUser() {
  try {
    await apiPost("/auth/logout.php");
  } catch {
    // Si el backend no responde, aun así limpiamos la interfaz local.
  }

  currentUser = null;
  persist();
  notify();
}
