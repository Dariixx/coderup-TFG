import { apiGet } from "./api";
import { getCourseImage, getInstructorAvatar, IMAGE_FALLBACK } from "./images";
import type { BlogCategory, BlogPost, Category, Course, Instructor, SEO, Tag } from "./types";
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
  IA: {
    description: "Inteligencia artificial aplicada a productos, automatización y asistentes útiles.",
    icon: "lucide:brain-circuit",
  },
  Ciberseguridad: {
    description: "Seguridad web, protección de datos, auditoría y buenas prácticas defensivas.",
    icon: "lucide:shield-check",
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
  Ciberseguridad: "Seguridad web, protección de datos y prácticas defensivas para productos digitales.",
  Automatización: "Flujos de trabajo, productividad técnica y automatización aplicada a proyectos reales.",
};

const blogCopyOverrides: Record<string, { title: string; excerpt: string; content: string; cover_image_url: string }> = {
  "guia-completa-hooks-react": {
    title: "Guía práctica de Hooks en React",
    excerpt: "Aprende cuándo usar useState, useEffect, useContext y custom hooks con ejemplos pensados para una plataforma de cursos.",
    content:
      "<h2>Por qué importan los hooks</h2><p>Los hooks permiten crear pantallas interactivas sin convertir cada componente en una estructura difícil de seguir. En CoderUp se usan para controlar formularios, filtros de cursos, carrito, autenticación y carga de datos desde la API.</p><p>useState ayuda con estados cercanos a la interfaz, como abrir un modal o recordar una búsqueda. useEffect sirve para sincronizar la pantalla con datos externos, por ejemplo al pedir cursos a MySQL. useContext es útil cuando una información debe compartirse entre varias zonas, como el usuario autenticado o el carrito.</p><h2>Buenas prácticas para clientes</h2><p>Un buen hook debe resolver una responsabilidad concreta y devolver nombres fáciles de entender. Esto mejora la accesibilidad del producto porque los estados de carga, error y éxito se muestran de forma clara, sin dejar al cliente esperando sin explicación.</p><p>También conviene cuidar las dependencias de useEffect. Si están mal definidas, la página puede repetir peticiones o enseñar datos desactualizados. Separar la lógica en hooks pequeños hace que el comportamiento sea más previsible y fácil de mantener.</p><h2>Conclusión</h2><p>Dominar hooks no consiste en memorizar funciones, sino en construir experiencias fluidas, comprensibles y preparadas para crecer.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=82",
  },
  "api-rest-mejores-practicas": {
    title: "API REST: respuestas claras para clientes",
    excerpt: "Diseña endpoints previsibles, mensajes de error útiles y respuestas consistentes para que el frontend sea más fiable.",
    content:
      "<h2>Una API como contrato</h2><p>Una API REST no es solo una lista de archivos en backend. Es el contrato que permite que la interfaz muestre cursos, posts, instructores, cupones y pedidos sin adivinar cómo llegan los datos.</p><p>Cuando las respuestas mantienen una estructura consistente, el frontend puede enseñar mensajes claros: cursos cargados, cupón aplicado, pedido completado o error de validación. Esto mejora la experiencia del cliente porque cada acción tiene una respuesta comprensible.</p><h2>Seguridad y mantenimiento</h2><p>Las buenas prácticas incluyen validación de entrada, prepared statements, tokens de sesión y códigos HTTP correctos. Un error 400 comunica datos inválidos, un 401 falta de autenticación, un 404 recurso inexistente y un 500 un fallo inesperado.</p><p>También conviene paginar listados, documentar campos y evitar exponer detalles internos. Así la aplicación puede crecer sin romper las pantallas existentes.</p><h2>Conclusión</h2><p>Una API profesional falla bien, protege los datos y permite que la experiencia del cliente sea estable.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=82",
  },
};

interface ApiCourseRecord {
  id: number;
  category_id: number;
  instructor_id?: number | null;
  category_name: string;
  category_slug: string;
  category_description?: string | null;
  instructor_name?: string | null;
  instructor_slug?: string | null;
  instructor_bio?: string | null;
  instructor_avatar_url?: string | null;
  instructor_specialty?: string | null;
  instructor_linkedin_url?: string | null;
  instructor_github_url?: string | null;
  instructor_twitter_url?: string | null;
  instructor_years_experience?: number | string | null;
  instructor_total_students?: number | string | null;
  instructor_rating?: number | string | null;
  title: string;
  slug: string;
  description: string;
  short_description?: string | null;
  image?: string | null;
  level: string;
  duration?: string | null;
  thumbnail_url?: string | null;
  duration_hours?: number | string | null;
  total_lessons?: number | string | null;
  total_students?: number | string | null;
  rating?: number | string | null;
  requirements?: string | string[] | null;
  what_you_learn?: string | string[] | null;
  curriculum?: string | Course["curriculum"] | null;
  price: number | string;
  is_premium?: number | boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface ApiInstructorRecord {
  id: number;
  user_id?: number;
  name: string;
  slug: string;
  email?: string;
  bio: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  twitter_url?: string | null;
  specialty: string;
  years_experience: number | string;
  total_students: number | string;
  rating: number | string;
}

interface ApiPostRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string | null;
  author_id?: number | null;
  author_name?: string | null;
  category: string;
  tags?: string | string[] | null;
  read_time: number | string;
  read_time_minutes?: number | string;
  is_published?: number | boolean;
  published_at: string;
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

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return value as T;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeCurriculum(value: unknown): Course["curriculum"] {
  const parsed = parseJsonField<any>(value, []);
  const modules = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.modulos) ? parsed.modulos : [];

  return modules.map((module: any, index: number) => ({
    title: module.title ?? module.nombre ?? `Módulo ${index + 1}`,
    lessons: Array.isArray(module.lessons) ? module.lessons : Array.isArray(module.lecciones) ? module.lecciones : [],
    duration: module.duration ?? module.duracion ?? "Contenido guiado",
  }));
}

function mapApiInstructor(record: ApiInstructorRecord): Instructor {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    role: record.specialty,
    bio: record.bio,
    avatarUrl: record.avatar_url ?? getInstructorAvatar(record.id),
    linkedinUrl: record.linkedin_url ?? undefined,
    githubUrl: record.github_url ?? undefined,
    twitterUrl: record.twitter_url ?? undefined,
    specialty: record.specialty,
    yearsExperience: Number(record.years_experience) || 0,
    totalStudents: Number(record.total_students) || 0,
    rating: Number(record.rating) || 4.8,
  };
}

function apiInstructorFromCourse(record: ApiCourseRecord, index: number): Instructor {
  if (!record.instructor_id || !record.instructor_name) {
    return {
      id: `instructor-${index}`,
      name: "Equipo CoderUp",
      slug: "equipo-coderup",
      role: `Instructor/a de ${record.category_name}`,
      bio: `Profesional especializado en ${record.category_name}.`,
      avatarUrl: getInstructorAvatar(index + 1),
      specialty: record.category_name,
    };
  }

  return {
    id: record.instructor_id,
    name: record.instructor_name,
    slug: record.instructor_slug ?? slugify(record.instructor_name),
    role: record.instructor_specialty ?? `Instructor/a de ${record.category_name}`,
    bio: record.instructor_bio ?? `Profesional especializado en ${record.category_name}.`,
    avatarUrl: record.instructor_avatar_url ?? getInstructorAvatar(record.instructor_id),
    linkedinUrl: record.instructor_linkedin_url ?? undefined,
    githubUrl: record.instructor_github_url ?? undefined,
    twitterUrl: record.instructor_twitter_url ?? undefined,
    specialty: record.instructor_specialty ?? record.category_name,
    yearsExperience: Number(record.instructor_years_experience) || 0,
    totalStudents: Number(record.instructor_total_students) || 0,
    rating: Number(record.instructor_rating) || 4.8,
  };
}

function mapApiCourse(record: ApiCourseRecord, index: number): Course {
  const price = Number(record.price);
  const isPremium = record.is_premium === undefined || record.is_premium === null ? price > 0 : Boolean(Number(record.is_premium));
  const isFree = price <= 0 || !isPremium;
  const requirements = parseJsonField<string[]>(record.requirements, []);
  const whatYouLearn = parseJsonField<string[]>(record.what_you_learn, []);
  const curriculum = normalizeCurriculum(record.curriculum);
  const totalLessons = Number(record.total_lessons) || 0;
  const durationHours = Number(record.duration_hours) || 0;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    shortDescription: record.short_description ?? truncateText(record.description, 120),
    category: createCategory(record.category_name, 0, record.category_description),
    level: record.level,
    price,
    isFree,
    accessType: isFree ? "free" : "premium",
    rating: Number(record.rating) || 0,
    students: Number(record.total_students) || 0,
    duration: record.duration ?? (durationHours ? `${durationHours}h de contenido` : "0h de contenido"),
    lessons: totalLessons,
    thumbnailUrl: record.thumbnail_url ?? record.image ?? getCourseImage(record.category_slug ?? record.category_name, record.id, record.title),
    durationHours,
    totalLessons,
    requirements,
    whatYouLearn,
    curriculum,
    featured: index < 6,
    icon: "lucide:code-2",
    iconColor: "text-[#00FF66]",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-600/20",
    instructor: apiInstructorFromCourse(record, index),
    seo: courseSeo(record.title, record.description),
  };
}

function mapApiPost(record: ApiPostRecord): BlogPost {
  const displayRecord = { ...record, ...blogCopyOverrides[record.slug] };
  const category = createBlogCategory(record.category);
  const tags = parseJsonField<string[]>(displayRecord.tags, []).map((tag, index) => ({
    id: `${displayRecord.slug}-${index}`,
    name: tag,
    slug: slugify(tag),
  }));

  return {
    id: displayRecord.id,
    slug: displayRecord.slug,
    title: displayRecord.title,
    excerpt: displayRecord.excerpt,
    content: displayRecord.content,
    publishedAt: displayRecord.published_at,
    readingTime: Number(displayRecord.read_time_minutes ?? displayRecord.read_time) || getReadingTime(displayRecord.content),
    author: displayRecord.author_name ?? "Equipo CoderUp",
    category,
    tags,
    icon: "lucide:file-text",
    iconColor: "text-[#00FF66]",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-purple-500/20",
    cover: { url: displayRecord.cover_image_url ?? IMAGE_FALLBACK },
    seo: postSeo(displayRecord.title, displayRecord.excerpt),
  };
}

async function fetchApiCourses(): Promise<Course[] | null> {
  try {
    const response = await apiGet<ApiCourseRecord[] | { courses: ApiCourseRecord[] }>("/api/courses.php");
    const courses = Array.isArray(response.data) ? response.data : response.data?.courses ?? [];
    return courses.map(mapApiCourse);
  } catch {
    return null;
  }
}

export async function getCourses(): Promise<Course[]> {
  const apiCourses = await fetchApiCourses();
  return apiCourses ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const response = await apiGet<ApiCourseRecord | { course: ApiCourseRecord }>(`/api/courses/${encodeURIComponent(slug)}.php`);
    const course = "course" in response.data ? response.data.course : response.data;

    if (course) {
      return mapApiCourse(course, 0);
    }
  } catch {
    return null;
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
  try {
    const response = await apiGet<ApiPostRecord[] | { posts: ApiPostRecord[] }>("/api/posts.php");
    const posts = Array.isArray(response.data) ? response.data : response.data?.posts ?? [];
    return posts.map(mapApiPost);
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await apiGet<ApiPostRecord | { post: ApiPostRecord }>(`/api/posts/${encodeURIComponent(slug)}.php`);
    const post = "post" in response.data ? response.data.post : response.data;
    if (post) {
      return mapApiPost(post);
    }
  } catch {
    return null;
  }

  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getInstructors(): Promise<Instructor[]> {
  try {
    const response = await apiGet<ApiInstructorRecord[] | { instructors: ApiInstructorRecord[] }>("/api/instructors.php");
    const instructors = Array.isArray(response.data) ? response.data : response.data?.instructors ?? [];
    if (instructors.length > 0) {
      return instructors.map(mapApiInstructor);
    }
  } catch {
    return [];
  }

  return [];
}

export async function getInstructorBySlug(slug: string): Promise<{ instructor: Instructor; courses: Course[] } | null> {
  try {
    const response = await apiGet<{ instructor: ApiInstructorRecord; courses: ApiCourseRecord[] }>(
      `/api/instructors/show.php?slug=${encodeURIComponent(slug)}`,
    );
    if (response.data?.instructor) {
      return {
        instructor: mapApiInstructor(response.data.instructor),
        courses: (response.data.courses ?? []).map(mapApiCourse),
      };
    }
  } catch {
    return null;
  }

  const courses = await getCourses();
  const instructorCourses = courses.filter((course) => course.instructor.slug === slug);
  if (instructorCourses.length === 0) {
    return null;
  }

  return {
    instructor: instructorCourses[0].instructor,
    courses: instructorCourses,
  };
}
