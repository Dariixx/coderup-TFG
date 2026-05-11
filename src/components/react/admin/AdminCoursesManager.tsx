import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useAuth } from "../useAuth";

interface CourseRecord {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  level: string;
  duration: string;
  price: number | string;
  is_premium: number | boolean;
}

const categories = [
  { id: 1, name: "Desarrollo Web" },
  { id: 2, name: "JavaScript" },
  { id: 3, name: "Backend" },
  { id: 4, name: "Bases de Datos" },
  { id: 5, name: "Diseño UX/UI" },
];

const emptyForm = {
  id: "",
  category_id: "1",
  title: "",
  slug: "",
  description: "",
  short_description: "",
  image: "/logo.webp",
  level: "Inicial",
  duration: "10 horas",
  price: "19.99",
  is_premium: true,
};

export default function AdminCoursesManager() {
  const { user, initialized } = useAuth();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const loadCourses = async () => {
    const response = await apiGet<{ courses: CourseRecord[] }>("/courses/index.php");
    setCourses(response.data?.courses ?? []);
  };

  useEffect(() => {
    loadCourses().catch((error) => {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se han podido cargar los cursos.");
    });
  }, []);

  if (!initialized) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">Cargando sesión...</div>;
  }

  if (!user || !["admin", "editor"].includes(user.role)) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">Necesitas rol `admin` o `editor` para gestionar cursos.</div>;
  }

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        ...form,
        id: form.id ? Number(form.id) : undefined,
        category_id: Number(form.category_id),
        price: Number(form.price),
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
      setMessage(error instanceof Error ? error.message : "No se ha podido guardar el curso.");
    }
  };

  const handleDelete = async (id: number) => {
    if (user.role !== "admin") {
      setStatus("error");
      setMessage("Solo el administrador puede eliminar cursos.");
      return;
    }

    try {
      await apiPost("/courses/delete.php", { id, _method: "DELETE" });
      setStatus("success");
      setMessage("Curso eliminado correctamente.");
      await loadCourses();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se ha podido eliminar el curso.");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{form.id ? "Editar curso" : "Crear curso"}</h2>
            <p className="text-sm text-[#888]">Formulario básico conectado con los endpoints PHP del CRUD.</p>
          </div>
          {form.id && (
            <button type="button" onClick={resetForm} className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm text-white hover:border-[#00FF66]/50 transition">
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Título" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          <input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug" className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          <select value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))} className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} placeholder="Nivel" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          <input value={form.duration} onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="Duración" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          <input type="number" step="0.01" min="0" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="Precio" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          <input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Imagen" className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white md:col-span-2" />
          <textarea value={form.short_description} onChange={(event) => setForm((prev) => ({ ...prev, short_description: event.target.value }))} placeholder="Descripción corta" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white md:col-span-2 min-h-24" />
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Descripción completa" required className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white md:col-span-2 min-h-32" />
        </div>

        <label className="flex items-center gap-3 text-sm text-white">
          <input type="checkbox" checked={form.is_premium} onChange={(event) => setForm((prev) => ({ ...prev, is_premium: event.target.checked }))} />
          Marcar como curso premium
        </label>

        <button type="submit" disabled={status === "loading"} className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition disabled:opacity-70">
          {status === "loading" ? "Guardando..." : form.id ? "Actualizar curso" : "Crear curso"}
        </button>

        {message && <p className={`rounded-xl px-4 py-3 text-sm ${status === "error" ? "bg-red-500/10 text-red-300" : "bg-[#00FF66]/10 text-[#9CFFBF]"}`}>{message}</p>}
      </form>

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Listado de cursos</h2>
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{course.title}</p>
                <p className="text-sm text-[#888]">{course.category_name} · {course.level} · {Number(course.price).toFixed(2)} €</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: String(course.id),
                      category_id: String(course.category_id),
                      title: course.title,
                      slug: course.slug,
                      description: course.description,
                      short_description: course.short_description,
                      image: "/logo.webp",
                      level: course.level,
                      duration: course.duration,
                      price: String(course.price),
                      is_premium: Boolean(Number(course.is_premium)),
                    })
                  }
                  className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm text-white hover:border-[#00FF66]/50 transition"
                >
                  Editar
                </button>
                {user.role === "admin" && (
                  <button type="button" onClick={() => handleDelete(course.id)} className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition">
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
