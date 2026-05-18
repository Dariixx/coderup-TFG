import { slugify } from "./utils";

export const IMAGE_FALLBACK = "/logo.webp";

export function getCourseImage(category?: string | null, id?: number | string | null, title?: string | null) {
  const key = slugify(`${category ?? ""} ${title ?? ""}`);
  const themes: Record<string, string> = {
    frontend: "javascript,webdesign",
    javascript: "javascript,programming",
    react: "react,javascript",
    backend: "nodejs,server",
    node: "nodejs,server",
    python: "python,coding",
    devops: "docker,devops",
    docker: "docker,linux",
    mobile: "mobile,app",
    app: "mobile,app",
    database: "database,sql",
    sql: "database,sql",
    datos: "database,sql",
    diseno: "css,webdesign",
    css: "css,webdesign",
  };

  const match = Object.entries(themes).find(([name]) => key.includes(name));
  const theme = match?.[1] ?? "coding,computer";

  return `https://source.unsplash.com/800x450/?${theme}&sig=${encodeURIComponent(String(id ?? (key || "course")))}`;
}

export function getInstructorAvatar(id?: number | string | null) {
  return `https://source.unsplash.com/200x200/?person,professional&sig=${encodeURIComponent(String(id ?? "instructor"))}`;
}

export function getAboutImage() {
  return "https://source.unsplash.com/1200x600/?team,office,technology";
}
