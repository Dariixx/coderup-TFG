import { cursos as mockCursos } from "../data/cursos";
import { posts as mockPosts } from "../data/posts";
import type { BlogCategory, BlogPost, Category, Course, SEO, StrapiCollectionResponse, Tag } from "./types";
import { getReadingTime, slugify, truncateText } from "./utils";

const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

const categoryMeta: Record<string, { description: string; icon: string }> = {
  Frontend: {
    description: "HTML, CSS, JavaScript, Astro, React Islands y experiencia de usuario moderna.",
    icon: "lucide:monitor",
  },
  Backend: {
    description: "APIs, bases de datos, seguridad, Node.js y servicios desacoplados.",
    icon: "lucide:server",
  },
  Fullstack: {
    description: "Arquitecturas end-to-end para crear productos completos.",
    icon: "lucide:layers-3",
  },
  DevOps: {
    description: "CI/CD, contenedores, despliegue e infraestructura para proyectos reales.",
    icon: "lucide:cloud",
  },
  Mobile: {
    description: "Desarrollo móvil multiplataforma y publicación de apps.",
    icon: "lucide:smartphone",
  },
  "Diseño UI/UX": {
    description: "Diseño de interfaces, accesibilidad y colaboración diseño-desarrollo.",
    icon: "lucide:palette",
  },
};

const blogCategoryDescriptions: Record<string, string> = {
  React: "Buenas prácticas, ecosistema y patrones modernos de React.",
  Frameworks: "Comparativas y análisis de frameworks del ecosistema frontend.",
  TypeScript: "Tipado, tooling y patrones robustos para proyectos mantenibles.",
  DevOps: "Automatización, deploy y operaciones para productos digitales.",
  CSS: "UI moderna, responsive design y nuevas capacidades del navegador.",
  Backend: "Arquitectura, APIs, rendimiento y seguridad de servidor.",
  Testing: "Calidad, automatización y estrategias de testing.",
  IA: "Herramientas de IA aplicadas al trabajo diario del developer.",
  UX: "Accesibilidad, experiencia de usuario y diseño centrado en producto.",
};

function courseSeo(title: string, description: string): SEO {
  return {
    metaTitle: `${title} | CoderUp`,
    metaDescription: truncateText(description, 155),
    canonicalURL: `/cursos/${slugify(title)}`,
    keywords: ["curso programación", "coderup", title.toLowerCase()],
  };
}

function postSeo(title: string, excerpt: string): SEO {
  return {
    metaTitle: `${title} | Blog de CoderUp`,
    metaDescription: truncateText(excerpt, 155),
    canonicalURL: `/blog/${slugify(title)}`,
    keywords: ["blog programación", "coderup", title.toLowerCase()],
  };
}

function toStudentCount(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized.endsWith("K")) {
    return Math.round(Number.parseFloat(normalized.replace("K", "")) * 1000);
  }

  return Number.parseInt(normalized, 10) || 0;
}

function createCategory(name: string, count = 0): Category {
  const meta = categoryMeta[name] ?? {
    description: `Contenido especializado en ${name} para avanzar con proyectos reales.`,
    icon: "lucide:folder",
  };

  return {
    id: slugify(name),
    name,
    slug: slugify(name),
    description: meta.description,
    icon: meta.icon,
    count,
    seo: {
      metaTitle: `${name} | CoderUp`,
      metaDescription: meta.description,
      canonicalURL: `/categorias/${slugify(name)}`,
      keywords: ["categorías", "coderup", name.toLowerCase()],
    },
  };
}

function createBlogCategory(name: string): BlogCategory {
  return {
    id: slugify(name),
    name,
    slug: slugify(name),
    description:
      blogCategoryDescriptions[name] ??
      `Artículos y tutoriales sobre ${name} para developers que buscan mantenerse al día.`,
  };
}

function createInstructor(category: string, index: number) {
  const instructors = [
    {
      name: "Lucía Romero",
      role: "Senior Frontend Engineer",
      bio: "Especialista en interfaces escalables con Astro, React y Tailwind CSS.",
    },
    {
      name: "Javier Ortega",
      role: "Backend & API Architect",
      bio: "Diseña arquitecturas desacopladas con Node.js, CMS headless y automatización.",
    },
    {
      name: "Marta Salas",
      role: "Product Engineer",
      bio: "Combina experiencia de usuario, analítica y lógica de negocio en productos formativos.",
    },
  ];

  const baseInstructor = instructors[index % instructors.length];

  return {
    id: `${slugify(baseInstructor.name)}-${index}`,
    name: baseInstructor.name,
    role: `${baseInstructor.role} · ${category}`,
    bio: baseInstructor.bio,
  };
}

function mapMockCourse(curso: (typeof mockCursos)[number], index: number): Course {
  const isFree = curso.price === 0;

  return {
    id: index + 1,
    slug: curso.slug,
    title: curso.title,
    description: curso.description,
    shortDescription: truncateText(curso.description, 110),
    category: createCategory(curso.category),
    level: curso.level,
    price: curso.price,
    isFree,
    accessType: isFree ? "free" : "premium",
    rating: curso.rating,
    students: toStudentCount(curso.students),
    duration: "12h de contenido",
    lessons: 85,
    featured: index < 6 || curso.rating >= 4.9,
    icon: curso.icon,
    iconColor: curso.iconColor,
    gradientFrom: curso.gradientFrom,
    gradientTo: curso.gradientTo,
    instructor: createInstructor(curso.category, index),
    seo: courseSeo(curso.title, curso.description),
  };
}

function generateMockContent(title: string, excerpt: string) {
  return `
## Introducción
${excerpt}

En CoderUp trabajamos con una arquitectura desacoplada para que el contenido evolucione sin rehacer la interfaz. Este artículo profundiza en ${title.toLowerCase()} con un enfoque práctico y orientado a producto.

## Qué aprenderás
- Fundamentos aplicables a proyectos reales.
- Buenas prácticas que puedes defender en un TFG.
- Recomendaciones para escalar la solución con Astro y Strapi.

## Aplicación real
La combinación de contenido bien modelado, páginas con await y componentes interactivos mediante Astro Islands permite mantener rendimiento, claridad y una UX profesional.

## Conclusión
La clave no es solo conocer la tecnología, sino saber integrarla dentro de una arquitectura clara, mantenible y preparada para crecer.
`.trim();
}

function mapMockPost(post: (typeof mockPosts)[number], index: number): BlogPost {
  const content = generateMockContent(post.title, post.excerpt);
  const category = createBlogCategory(post.category);
  const tags: Tag[] = [
    { id: `${post.slug}-1`, name: post.category, slug: slugify(post.category) },
    { id: `${post.slug}-2`, name: "Astro", slug: "astro" },
    { id: `${post.slug}-3`, name: "Strapi", slug: "strapi" },
  ];

  return {
    id: index + 1,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content,
    publishedAt: new Date(`2026-${String(index % 12 + 1).padStart(2, "0")}-${String(index % 27 + 1).padStart(2, "0")}`).toISOString(),
    readingTime: getReadingTime(content),
    author: post.author,
    category,
    tags,
    icon: post.icon,
    iconColor: post.iconColor,
    gradientFrom: post.gradientFrom,
    gradientTo: post.gradientTo,
    seo: postSeo(post.title, post.excerpt),
  };
}

function getMockCoursesData() {
  return mockCursos.map(mapMockCourse);
}

function getMockBlogPostsData() {
  return mockPosts.map(mapMockPost);
}

function normalizeStrapiData<T>(payload: unknown): T {
  const data = payload as { data?: T };
  return data?.data ?? (payload as T);
}

export async function fetchFromStrapi<T>(endpoint: string): Promise<T | null> {
  if (!STRAPI_URL) {
    return null;
  }

  try {
    const url = new URL(endpoint, STRAPI_URL);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Strapi respondió con ${response.status}`);
    }

    const payload = (await response.json()) as T;
    return payload;
  } catch (error) {
    console.warn(`[CoderUp] Fallback mock activo para ${endpoint}:`, error);
    return null;
  }
}

export async function getCourses(): Promise<Course[]> {
  const response = await fetchFromStrapi<StrapiCollectionResponse<Course>>("/api/courses?populate=*");
  const strapiCourses = response ? normalizeStrapiData<Course[]>(response) : null;

  // Fallback mock para desarrollo mientras Strapi no está disponible.
  return Array.isArray(strapiCourses) && strapiCourses.length > 0 ? strapiCourses : getMockCoursesData();
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await getCourses();
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetchFromStrapi<StrapiCollectionResponse<Category>>("/api/categories?populate=*");
  const strapiCategories = response ? normalizeStrapiData<Category[]>(response) : null;

  if (Array.isArray(strapiCategories) && strapiCategories.length > 0) {
    return strapiCategories;
  }

  const courses = await getCourses();
  const counts = new Map<string, number>();

  courses.forEach((course) => {
    counts.set(course.category.name, (counts.get(course.category.name) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, count]) => createCategory(name, count));
}

export async function getCoursesByCategory(categorySlug: string): Promise<Course[]> {
  const courses = await getCourses();
  return courses.filter((course) => course.category.slug === categorySlug);
}

export async function getFeaturedCourses(limit = 3): Promise<Course[]> {
  const courses = await getCourses();
  return courses.filter((course) => course.featured).slice(0, limit);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await fetchFromStrapi<StrapiCollectionResponse<BlogPost>>("/api/posts?populate=*");
  const strapiPosts = response ? normalizeStrapiData<BlogPost[]>(response) : null;

  return Array.isArray(strapiPosts) && strapiPosts.length > 0 ? strapiPosts : getMockBlogPostsData();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
