import type { Course } from "./types";

const FAVORITES_KEY = "coderup-favorites";
const FAVORITES_EVENT = "coderup:favorites";

export interface FavoriteCourse {
  id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  price: number;
  thumbnailUrl?: string;
  instructorName: string;
}

function storageKey(userId?: string | null) {
  return `${FAVORITES_KEY}:${userId || "anon"}`;
}

function emit() {
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function courseToFavorite(course: Course): FavoriteCourse {
  return {
    id: String(course.id),
    slug: course.slug,
    title: course.title,
    category: course.category.name,
    level: course.level,
    price: course.price,
    thumbnailUrl: course.thumbnailUrl,
    instructorName: course.instructor.name,
  };
}

export function getFavorites(userId?: string | null): FavoriteCourse[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string, userId?: string | null) {
  return getFavorites(userId).some((favorite) => favorite.slug === slug);
}

export function toggleFavorite(course: FavoriteCourse, userId?: string | null) {
  const favorites = getFavorites(userId);
  const exists = favorites.some((favorite) => favorite.slug === course.slug);
  const next = exists ? favorites.filter((favorite) => favorite.slug !== course.slug) : [course, ...favorites];
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  emit();
  return !exists;
}

export function subscribeFavorites(listener: () => void) {
  window.addEventListener(FAVORITES_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
