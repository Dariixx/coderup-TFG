import { cursos as mockCursos } from "../data/cursos";
import { posts as mockPosts } from "../data/posts";
import { apiGet } from "./api";
import type { BlogCategory, BlogPost, Category, Course, SEO, Tag } from "./types";
import { getReadingTime, slugify, truncateText } from "./utils";

const categoryMeta: Record<string, { description: string; icon: string }> = {
  "Desarrollo Web": {
    description: "Fundamentos web, maquetación moderna y experiencias responsive con enfoque práctico.",
    icon: "lucide:monitor-smartphone",
  },
  JavaScript: {
    description: "Programación moderna en frontend y fullstack con ejercicios reales.",
    icon: "lucide:file-code-2",
  },
  Backend: {
    description: "APIs, lógica de negocio, seguridad y desarrollo de servidor.",
    icon: "lucide:server",
  },
  "Bases de Datos": {
    description: "Modelado relacional, SQL y persistencia para proyectos académicos y reales.",
    icon: "lucide:database",
  },
  "Diseño UX/UI": {
    description: "Diseño centrado en el usuario, accesibilidad y colaboración con desarrollo.",
    icon: "lucide:palette",
  },
  Frontend: {
    description: "Interfaces modernas con HTML, CSS, Astro y React.",
    icon: "lucide:monitor",
  },
  Fullstack: {
    description: "Arquitecturas completas de extremo a extremo para productos digitales.",
    icon: "lucide:layers-3",
  },
  DevOps: {
    description: "Automatización, despliegue y prácticas de entrega continua.",
    icon: "lucide:cloud",
  },
  Mobile: {
    description: "Desarrollo móvil multiplataforma y publicación de apps.",
    icon: "lucide:smartphone",
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

interface ApiCourseRecord {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  category_description?: string | null;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  image?: string | null;
  level: string;
  duration: string;
  price: number | string;
  is_premium: number | boolean;
  created_at?: string;
  updated_at?: string;
}

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

function createCategory(name: string, count = 0, description?: string | null): Category {
  const meta = categoryMeta[name] ?? {
    description: `Contenido especializado en ${name} para avanzar con proyectos reales.`,
    icon: "lucide:folder",
  };

  return {
    id: slugify(name),
    name,
    slug: slugify(name),
    description: description ?? meta.description,
    icon: meta.icon,
    count,
    seo: {
      metaTitle: `${name} | CoderUp`,
      metaDescription: description ?? meta.description,
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
      bio: "Especialista en interfaces escalables con Astro, React y TypeScript.",
    },
    {
      name: "Javier Ortega",
      role: "Backend & API Architect",
      bio: "Diseña servicios backend claros con PHP, MySQL y APIs JSON defendibles.",
    },
    {
      name: "Marta Salas",
      role: "Product Engineer",
      bio: "Conecta UX, producto y lógica de negocio en plataformas formativas.",
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
- Recomendaciones para escalar la solución con Astro, React y un backend propio en PHP.

## Aplicación real
La combinación de contenido bien modelado, páginas con render híbrido y componentes interactivos mediante Astro Islands permite mantener rendimiento, claridad y una UX profesional.

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
    { id: `${post.slug}-3`, name: "PHP", slug: "php" },
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

function courseVisualFallback(slug: string, index: number) {
  const mockCourses = getMockCoursesData();
  return mockCourses.find((course) => course.slug === slug) ?? mockCourses[index % mockCourses.length];
}

function mapApiCourse(record: ApiCourseRecord, index: number): Course {
  const fallback = courseVisualFallback(record.slug, index);
  const price = Number(record.price);
  const isPremium = Boolean(Number(record.is_premium));
  const isFree = price <= 0 || !isPremium;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    shortDescription: record.short_description,
    category: createCategory(record.category_name, 0, record.category_description),
    level: record.level,
    price,
    isFree,
    accessType: isFree ? "free" : "premium",
    rating: fallback?.rating ?? 4.8,
    students: fallback?.students ?? 1200,
    duration: record.duration,
    lessons: fallback?.lessons ?? 48,
    featured: index < 6,
    icon: fallback?.icon ?? "lucide:code-2",
    iconColor: fallback?.iconColor ?? "text-[#00FF66]",
    gradientFrom: fallback?.gradientFrom ?? "from-emerald-500/20",
    gradientTo: fallback?.gradientTo ?? "to-teal-600/20",
    instructor: fallback?.instructor ?? createInstructor(record.category_name, index),
    seo: courseSeo(record.title, record.description),
  };
}

async function fetchApiCourses(): Promise<Course[] | null> {
  try {
    const response = await apiGet<{ courses: ApiCourseRecord[] }>("/courses/index.php");
    const courses = response.data?.courses ?? [];
    return courses.map(mapApiCourse);
  } catch (error) {
    if (!import.meta.env.SSR) {
      console.warn("[CoderUp] Fallback a datos locales para cursos:", error);
    }
    return null;
  }
}

export async function getCourses(): Promise<Course[]> {
  const apiCourses = await fetchApiCourses();
  return apiCourses && apiCourses.length > 0 ? apiCourses : getMockCoursesData();
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const response = await apiGet<{ course: ApiCourseRecord }>(`/courses/show.php?slug=${encodeURIComponent(slug)}`);
    const course = response.data?.course;

    if (course) {
      return mapApiCourse(course, 0);
    }
  } catch (error) {
    if (!import.meta.env.SSR) {
      console.warn("[CoderUp] Fallback a detalle local de curso:", error);
    }
  }

  const courses = await getCourses();
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const courses = await getCourses();
  const counts = new Map<string, number>();
  const descriptions = new Map<string, string>();

  courses.forEach((course) => {
    counts.set(course.category.name, (counts.get(course.category.name) ?? 0) + 1);
    descriptions.set(course.category.name, course.category.description);
  });

  return Array.from(counts.entries()).map(([name, count]) => createCategory(name, count, descriptions.get(name)));
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
  return getMockBlogPostsData();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
