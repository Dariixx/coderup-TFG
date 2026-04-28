import type { StoredUser, User } from "./types";
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./utils";

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

  if (users.some((user) => user.email === email)) {
    return { ok: false as const, message: "Ya existe una cuenta con este email." };
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  const nextUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: input.password,
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

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false as const, message: "Introduce un email válido." };
  }

  if (!PASSWORD_REGEX.test(input.password)) {
    return { ok: false as const, message: "La contraseña debe tener al menos 6 caracteres." };
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const match = users.find((user) => user.email === email && user.password === input.password);

  if (!match) {
    return { ok: false as const, message: "Credenciales incorrectas." };
  }

  currentUser = sanitizeUser(match);
  persist();
  notify();

  return { ok: true as const, user: currentUser };
}

export function logoutUser() {
  currentUser = null;
  persist();
  notify();
}

export function updateCurrentUser(patch: Partial<User>) {
  if (!currentUser) {
    return;
  }

  currentUser = { ...currentUser, ...patch };
  users = users.map((user) => (user.id === currentUser?.id ? { ...user, ...patch } : user));
  persist();
  notify();
}
