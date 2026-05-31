import { slugify } from "./utils";

export const IMAGE_FALLBACK = "/logo.webp";

const UNSPLASH_PARAMS = "auto=format&fit=crop&w=1200&q=82";

const courseImages: Array<[string, string]> = [
  ["react", `https://images.unsplash.com/photo-1633356122544-f134324a6cee?${UNSPLASH_PARAMS}`],
  ["typescript", `https://images.unsplash.com/photo-1516116216624-53e697fedbea?${UNSPLASH_PARAMS}`],
  ["javascript", `https://images.unsplash.com/photo-1627398242454-45a1465c2479?${UNSPLASH_PARAMS}`],
  ["node", `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${UNSPLASH_PARAMS}`],
  ["backend", `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${UNSPLASH_PARAMS}`],
  ["api", `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${UNSPLASH_PARAMS}`],
  ["python", `https://images.unsplash.com/photo-1526379095098-d400fd0bf935?${UNSPLASH_PARAMS}`],
  ["docker", `https://images.unsplash.com/photo-1605745341112-85968b19335b?${UNSPLASH_PARAMS}`],
  ["kubernetes", `https://images.unsplash.com/photo-1605745341112-85968b19335b?${UNSPLASH_PARAMS}`],
  ["devops", `https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?${UNSPLASH_PARAMS}`],
  ["git", `https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?${UNSPLASH_PARAMS}`],
  ["sql", `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${UNSPLASH_PARAMS}`],
  ["base", `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${UNSPLASH_PARAMS}`],
  ["database", `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${UNSPLASH_PARAMS}`],
  ["html", `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?${UNSPLASH_PARAMS}`],
  ["css", `https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?${UNSPLASH_PARAMS}`],
  ["tailwind", `https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?${UNSPLASH_PARAMS}`],
  ["mobile", `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${UNSPLASH_PARAMS}`],
  ["native", `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${UNSPLASH_PARAMS}`],
  ["react-native", `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?${UNSPLASH_PARAMS}`],
  ["ux", `https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?${UNSPLASH_PARAMS}`],
  ["ui", `https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?${UNSPLASH_PARAMS}`],
  ["diseno", `https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?${UNSPLASH_PARAMS}`],
  ["astro", `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?${UNSPLASH_PARAMS}`],
  ["apis-rest", `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?${UNSPLASH_PARAMS}`],
  ["bases-de-datos", `https://images.unsplash.com/photo-1544383835-bda2bc66a55d?${UNSPLASH_PARAMS}`],
  ["html-css", `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?${UNSPLASH_PARAMS}`],
  ["ia", `https://images.unsplash.com/photo-1677442136019-21780ecad995?${UNSPLASH_PARAMS}`],
  ["inteligencia-artificial", `https://images.unsplash.com/photo-1677442136019-21780ecad995?${UNSPLASH_PARAMS}`],
  ["machine-learning", `https://images.unsplash.com/photo-1555255707-c07966088b7b?${UNSPLASH_PARAMS}`],
  ["ciberseguridad", `https://images.unsplash.com/photo-1563986768609-322da13575f3?${UNSPLASH_PARAMS}`],
  ["seguridad", `https://images.unsplash.com/photo-1563986768609-322da13575f3?${UNSPLASH_PARAMS}`],
  ["frontend", `https://images.unsplash.com/photo-1498050108023-c5249f4df085?${UNSPLASH_PARAMS}`],
];

const instructorAvatars = [
  "/instructors/juan-garcia.jpeg",
  "/instructors/maria-lopez.png",
  "/instructors/carlos-rodriguez.png",
  "/instructors/ana-martinez.png",
];

export function getCourseImage(category?: string | null, id?: number | string | null, title?: string | null) {
  const key = slugify(`${category ?? ""} ${title ?? ""}`);
  const match = courseImages.find(([name]) => key.includes(name));
  return match?.[1] ?? `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?${UNSPLASH_PARAMS}`;
}

export function getInstructorAvatar(id?: number | string | null) {
  const index = Math.abs((Number(id) || 1) - 1) % instructorAvatars.length;
  return instructorAvatars[index];
}

export function getAboutImage() {
  return `https://images.unsplash.com/photo-1552664730-d307ca884978?${UNSPLASH_PARAMS}`;
}
