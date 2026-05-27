import { useEffect, useState } from "react";
import { apiGet, apiPost, getApiHelpMessage } from "../../../lib/api";
import { getCourseImage, IMAGE_FALLBACK } from "../../../lib/images";
import { useAuth } from "../useAuth";

interface CourseRecord {
  id: number;
  category_id: number;
  instructor_id?: number;
  category_name: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail_url?: string | null;
  level: string;
  duration?: string;
  duration_hours?: number | string;
  total_lessons?: number | string;
  total_students?: number | string;
  rating?: number | string;
  price: number | string;
  is_premium?: number | boolean;
  is_published?: number | boolean;
  instructor_name?: string;
  requirements?: string[] | string | null;
  what_you_learn?: string[] | string | null;
  curriculum?: Array<{ title?: string; nombre?: string; lessons?: string[]; lecciones?: string[]; duration?: string; duracion?: string }> | { modulos?: any[] } | string | null;
}

const categories = [
  { id: 1, name: "Frontend" },
  { id: 2, name: "Backend" },
  { id: 3, name: "DevOps" },
  { id: 4, name: "Mobile" },
  { id: 5, name: "Diseño" },
];

const emptyForm = {
  id: "",
  category_id: "1",
  instructor_id: "1",
  title: "",
  slug: "",
  description: "",
  image: getCourseImage("frontend", "admin-new", "Nuevo curso"),
  level: "Inicial",
  duration_hours: "10",
  total_lessons: "20",
  price: "19.99",
  is_premium: true,
  is_published: true,
  requirements: "Ninguno",
  what_you_learn: "Objetivos claros del curso\nProyecto práctico guiado\nBuenas prácticas profesionales",
  curriculum: "Módulo 1: Introducción | Bienvenida; Preparación del entorno; Primer ejercicio\nMódulo 2: Proyecto guiado | Desarrollo paso a paso; Revisión; Entrega final",
};

function courseImage(course: CourseRecord) {
  return course.thumbnail_url || getCourseImage(course.category_name, course.id, course.title);
}

function listToText(value: CourseRecord["requirements"] | CourseRecord["what_you_learn"]) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join("\n") : value;
    } catch {
      return value;
    }
  }
  return "";
}

function curriculumToText(value: CourseRecord["curriculum"]) {
  const rawModules = typeof value === "string" ? (() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : parsed?.modulos;
    } catch {
      return [];
    }
  })() : Array.isArray(value) ? value : value?.modulos;

  return (rawModules ?? [])
    .map((module: any) => {
      const title = module.title ?? module.nombre ?? "Módulo";
      const lessons = Array.isArray(module.lessons) ? module.lessons : Array.isArray(module.lecciones) ? module.lecciones : [];
      const duration = module.duration ?? module.duracion;
      return `${title}${duration ? ` (${duration})` : ""} | ${lessons.join("; ")}`;
    })
    .join("\n");
}

function textToList(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

function textToCurriculum(value: string) {
  const modulos = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [titlePart, lessonsPart = ""] = line.split("|");
      const durationMatch = titlePart.match(/\(([^)]+)\)\s*$/);
      const title = titlePart.replace(/\s*\([^)]+\)\s*$/, "").trim() || `Módulo ${index + 1}`;
      return {
        nombre: title,
        duracion: durationMatch?.[1] ?? "Contenido guiado",
        lecciones: lessonsPart.split(";").map((lesson) => lesson.trim()).filter(Boolean),
      };
    });

  return { modulos };
}

function courseToForm(course: CourseRecord) {
  return {
    id: String(course.id),
    category_id: String(course.category_id),
    instructor_id: String(course.instructor_id ?? 1),
    title: course.title,
    slug: course.slug,
    description: course.description,
    image: courseImage(course),
    level: course.level,
    duration_hours: String(course.duration_hours ?? 10),
    total_lessons: String(course.total_lessons ?? 20),
    price: String(course.price),
    is_premium: course.is_premium === undefined ? Number(course.price) > 0 : Boolean(Number(course.is_premium)),
    is_published: course.is_published === undefined ? true : Boolean(Number(course.is_published)),
    requirements: listToText(course.requirements),
    what_you_learn: listToText(course.what_you_learn),
    curriculum: curriculumToText(course.curriculum),
  };
}

export default function AdminCoursesManager() {
  const { user, initialized } = useAuth();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const loadCourses = async () => {
    setListStatus("loading");
    const response = await apiGet<CourseRecord[] | { courses: CourseRecord[] }>("/courses/index.php?all=1&limit=50");
    const nextCourses = Array.isArray(response.data) ? response.data : response.data?.courses ?? [];
    setCourses(nextCourses);
    setSelectedCourse((current) => {
      if (!current) return nextCourses[0] ?? null;
      return nextCourses.find((course) => course.id === current.id) ?? nextCourses[0] ?? null;
    });
    setListStatus("success");
  };

  useEffect(() => {
    if (!initialized || !user || !["admin", "editor"].includes(user.role)) {
      return;
    }

    loadCourses().catch((error) => {
      setListStatus("error");
      setStatus("error");
      setMessage(getApiHelpMessage(error));
    });
  }, [initialized, user?.role]);

  if (!initialized) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">Cargando sesión...</div>;
  }

  if (!user || !["admin", "editor"].includes(user.role)) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">Necesitas rol `admin` o `editor` para gestionar cursos.</div>;
  }

  const resetForm = () => {
    setForm(emptyForm);
    setStatus("idle");
    setMessage("");
  };

  const handleView = (course: CourseRecord) => {
    setSelectedCourse(course);
  };

  const handleEdit = (course: CourseRecord) => {
    setSelectedCourse(course);
    setForm(courseToForm(course));
    setStatus("idle");
    setMessage("");
    window.requestAnimationFrame(() => {
      document.getElementById("admin-course-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        id: form.id ? Number(form.id) : undefined,
        title: form.title,
        slug: form.slug,
        description: form.description,
        thumbnail_url: form.image,
        category_id: Number(form.category_id),
        instructor_id: Number(form.instructor_id),
        price: Number(form.price),
        level: form.level,
        duration_hours: Number(form.duration_hours),
        total_lessons: Number(form.total_lessons),
        requirements: textToList(form.requirements),
        what_you_learn: textToList(form.what_you_learn),
        curriculum: textToCurriculum(form.curriculum),
        is_published: form.is_published ? 1 : 0,
        is_premium: form.is_premium ? 1 : 0,
      };

      if (form.id) {
        await apiPost("/courses/update.php", { ...payload, _method: "PUT" });
        setMessage("Curso actualizado correctamente.");
      } else {
        await apiPost("/courses/create.php", payload);
        setMessage("Curso creado correctamente.");
      }

      setStatus("success");
      resetForm();
      await loadCourses();
    } catch (error) {
      setStatus("error");
      setMessage(getApiHelpMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    if (user.role !== "admin") {
      setStatus("error");
      setMessage("Solo el administrador puede eliminar cursos.");
      return;
    }

    if (!window.confirm("¿Seguro que quieres eliminar este curso?")) {
      return;
    }

    try {
      await apiPost("/courses/delete.php", { id, _method: "DELETE" });
      setStatus("success");
      setMessage("Curso eliminado correctamente.");
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
      await loadCourses();
    } catch (error) {
      setStatus("error");
      setMessage(getApiHelpMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Cursos en la base de datos</h2>
            <p className="text-sm text-[#888]">Carga todos los cursos, publicados u ocultos, para revisarlos, editarlos o eliminarlos desde el panel.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              loadCourses().catch((error) => {
                setListStatus("error");
                setMessage(getApiHelpMessage(error));
              });
            }}
            className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#00FF66]/50"
          >
            {listStatus === "loading" ? "Actualizando..." : "Actualizar listado"}
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111] p-5 text-[#888]">
            No hay cursos en la base de datos. Crea el primero desde este formulario.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[#888]">
                <tr className="border-b border-[#2A2A2A]">
                  <th className="pb-3 pr-4">Curso</th>
                  <th className="pb-3 pr-4">Categoria</th>
                  <th className="pb-3 pr-4">Nivel</th>
                  <th className="pb-3 pr-4">Precio</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const selected = selectedCourse?.id === course.id;

                  return (
                    <tr key={course.id} className={`border-b border-[#2A2A2A] ${selected ? "bg-[#00FF66]/5" : ""}`}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={courseImage(course)}
                            alt={course.title}
                            className="h-12 w-16 rounded-lg bg-[#111111] object-cover"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = IMAGE_FALLBACK;
                            }}
                          />
                          <div>
                            <p className="font-semibold text-white">{course.title}</p>
                            <p className="text-xs text-[#777]">/{course.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-[#E0E0E0]">{course.category_name}</td>
                      <td className="py-4 pr-4 text-[#888]">{course.level}</td>
                      <td className="py-4 pr-4 font-semibold text-[#00FF66]">{Number(course.price).toFixed(2)} €</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs ${course.is_published === false || Number(course.is_published) === 0 ? "bg-red-500/10 text-red-200" : "bg-[#00FF66]/10 text-[#00FF66]"}`}>
                          {course.is_published === false || Number(course.is_published) === 0 ? "Oculto" : "Publicado"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleView(course)} className="rounded-lg border border-[#2A2A2A] px-3 py-2 text-xs text-white transition hover:border-[#00FF66]/50">
                            Ver
                          </button>
                          <button type="button" onClick={() => handleEdit(course)} className="rounded-lg border border-[#2A2A2A] px-3 py-2 text-xs text-white transition hover:border-[#00FF66]/50">
                            Editar
                          </button>
                          {user.role === "admin" && (
                            <button type="button" onClick={() => handleDelete(course.id)} className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10">
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCourse && (
        <section className="grid gap-6 lg:grid-cols-[320px_1fr] rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <img
            src={courseImage(selectedCourse)}
            alt={selectedCourse.title}
            className="h-56 w-full rounded-xl bg-[#111111] object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = IMAGE_FALLBACK;
            }}
          />
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 text-xs text-[#00FF66]">{selectedCourse.category_name}</span>
              <span className="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs text-white">{selectedCourse.level}</span>
              <span className="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs text-white">{selectedCourse.total_lessons ?? 0} lecciones</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{selectedCourse.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#888]">{selectedCourse.description}</p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <p className="text-[#888]">Precio</p>
                <p className="text-lg font-bold text-[#00FF66]">{Number(selectedCourse.price).toFixed(2)} €</p>
              </div>
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <p className="text-[#888]">Duracion</p>
                <p className="text-lg font-bold text-white">{selectedCourse.duration_hours ?? 0} h</p>
              </div>
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <p className="text-[#888]">Alumnos</p>
                <p className="text-lg font-bold text-white">{selectedCourse.total_students ?? 0}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`/cursos/${selectedCourse.slug}`} target="_blank" rel="noreferrer" className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm text-white transition hover:border-[#00FF66]/50">
                Ver en la web
              </a>
              <button type="button" onClick={() => handleEdit(selectedCourse)} className="rounded-xl bg-[#00FF66] px-4 py-2 text-sm font-bold text-[#0A0A0A] transition hover:bg-[#00CC52]">
                Editar este curso
              </button>
            </div>
          </div>
        </section>
      )}

      <form id="admin-course-form" onSubmit={handleSubmit} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{form.id ? "Editar curso" : "Crear curso"}</h2>
            <p className="text-sm text-[#888]">Selecciona un curso del listado para editarlo individualmente o crea uno nuevo.</p>
          </div>
          {form.id && (
            <button type="button" onClick={resetForm} className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm text-white hover:border-[#00FF66]/50 transition">
              Nuevo curso
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm text-[#888]">
            <span>Titulo</span>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Categoria</span>
            <select value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))} className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>ID instructor</span>
            <input type="number" min="1" value={form.instructor_id} onChange={(event) => setForm((prev) => ({ ...prev, instructor_id: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Nivel</span>
            <input value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Horas de duracion</span>
            <input type="number" min="0" value={form.duration_hours} onChange={(event) => setForm((prev) => ({ ...prev, duration_hours: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Lecciones</span>
            <input type="number" min="0" value={form.total_lessons} onChange={(event) => setForm((prev) => ({ ...prev, total_lessons: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Precio</span>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} required className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888] md:col-span-2">
            <span>Imagen</span>
            <input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888] md:col-span-2">
            <span>Descripcion completa</span>
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} required className="min-h-36 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Requisitos, uno por linea</span>
            <textarea value={form.requirements} onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))} className="min-h-32 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888]">
            <span>Lo que aprendera, uno por linea</span>
            <textarea value={form.what_you_learn} onChange={(event) => setForm((prev) => ({ ...prev, what_you_learn: event.target.value }))} className="min-h-32 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
          <label className="space-y-2 text-sm text-[#888] md:col-span-2">
            <span>Temario: Modulo (duracion) | Leccion; Leccion; Leccion</span>
            <textarea value={form.curriculum} onChange={(event) => setForm((prev) => ({ ...prev, curriculum: event.target.value }))} className="min-h-40 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </label>
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-3 text-sm text-white">
            <input type="checkbox" checked={form.is_premium} onChange={(event) => setForm((prev) => ({ ...prev, is_premium: event.target.checked }))} />
            Curso premium
          </label>
          <label className="flex items-center gap-3 text-sm text-white">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))} />
            Publicado
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={status === "loading"} className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition disabled:opacity-70">
            {status === "loading" ? "Guardando..." : form.id ? "Guardar cambios" : "Crear curso"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="rounded-xl border border-[#2A2A2A] px-5 py-3 font-semibold text-white hover:border-[#00FF66]/50 transition">
              Cancelar
            </button>
          )}
        </div>

        {message && <p className={`rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-red-500/10 text-red-300" : "bg-[#00FF66]/10 text-[#9CFFBF]"}`}>{message}</p>}
      </form>
    </div>
  );
}
