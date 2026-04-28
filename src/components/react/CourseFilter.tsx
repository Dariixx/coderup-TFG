import { useState } from "react";

const categories = ["Todos", "Frontend", "Backend", "Full Stack", "DevOps", "Mobile"];
const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];

const allCourses = [
  { title: "React Avanzado", category: "Frontend", level: "Avanzado", price: 49.99, rating: 4.9, students: 2300, gradient: "from-blue-600/20 to-purple-600/20", description: "Hooks, Context, patrones avanzados y arquitectura de aplicaciones React." },
  { title: "Node.js & APIs REST", category: "Backend", level: "Intermedio", price: 39.99, rating: 4.8, students: 1800, gradient: "from-green-600/20 to-emerald-600/20", description: "Crea APIs robustas con Express, autenticación JWT y bases de datos." },
  { title: "JavaScript Moderno", category: "Frontend", level: "Principiante", price: 29.99, rating: 4.9, students: 3100, gradient: "from-orange-600/20 to-yellow-600/20", description: "ES6+, async/await, DOM, y todo lo que necesitas para dominar JS." },
  { title: "TypeScript Pro", category: "Frontend", level: "Intermedio", price: 44.99, rating: 4.8, students: 1500, gradient: "from-blue-500/20 to-cyan-500/20", description: "Tipado estático, generics, decorators y patrones avanzados." },
  { title: "Python Full Stack", category: "Full Stack", level: "Intermedio", price: 54.99, rating: 4.7, students: 2100, gradient: "from-yellow-500/20 to-green-500/20", description: "Django, REST APIs, PostgreSQL y despliegue en producción." },
  { title: "Docker & Kubernetes", category: "DevOps", level: "Avanzado", price: 59.99, rating: 4.9, students: 980, gradient: "from-cyan-500/20 to-blue-500/20", description: "Contenedores, orquestación y CI/CD pipelines profesionales." },
  { title: "React Native", category: "Mobile", level: "Intermedio", price: 49.99, rating: 4.7, students: 1200, gradient: "from-purple-500/20 to-pink-500/20", description: "Aplicaciones móviles nativas con React Native y Expo." },
  { title: "Astro para Contenido", category: "Full Stack", level: "Avanzado", price: 54.99, rating: 4.9, students: 1600, gradient: "from-gray-500/20 to-white/10", description: "Islands, rendimiento, CMS headless y despliegue profesional con Astro." },
  { title: "CSS Avanzado", category: "Frontend", level: "Intermedio", price: 24.99, rating: 4.6, students: 2800, gradient: "from-pink-500/20 to-rose-500/20", description: "Grid, Flexbox, animaciones, responsive design y Tailwind CSS." },
];

export default function CourseFilter() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = allCourses.filter((course) => {
    const matchCategory = selectedCategory === "Todos" || course.category === selectedCategory;
    const matchLevel = selectedLevel === "Todos" || course.level === selectedLevel;
    const matchSearch = course.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchLevel && matchSearch;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-6 py-4 text-white placeholder-[#888] focus:outline-none focus:border-[#00FF66] transition"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat
                  ? "bg-[#00FF66] text-[#0A0A0A]"
                  : "bg-[#1A1A1A] text-[#888] border border-[#2A2A2A] hover:border-[#00FF66]/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedLevel === lvl
                  ? "bg-[#00FF66] text-[#0A0A0A]"
                  : "bg-[#1A1A1A] text-[#888] border border-[#2A2A2A] hover:border-[#00FF66]/50"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[#888] mb-6">{filtered.length} curso{filtered.length !== 1 && "s"} encontrado{filtered.length !== 1 && "s"}</p>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((course, i) => (
          <a
            href={`/cursos/${course.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
            key={i}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#00FF66]/50 transition group"
          >
            <div className={`h-48 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
              <svg className="w-16 h-16 text-[#00FF66]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 17.25 12l-3 2.25m-4.5-4.5L6.75 12l3 2.25M12 3l-1.664 5.822a2.25 2.25 0 01-1.555 1.555L3 12l5.781 1.623a2.25 2.25 0 011.555 1.555L12 21l1.664-5.822a2.25 2.25 0 011.555-1.555L21 12l-5.781-1.623a2.25 2.25 0 01-1.555-1.555L12 3z" />
              </svg>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                <span className="bg-[#00FF66]/10 text-[#00FF66] text-xs px-2 py-1 rounded-full">{course.category}</span>
                <span className="bg-[#00FF66]/10 text-[#00FF66] text-xs px-2 py-1 rounded-full">{course.level}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00FF66] transition">{course.title}</h3>
              <p className="text-[#888] text-sm mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#00FF66] font-bold text-lg">{course.price}€</span>
                <span className="text-[#888] text-sm">{course.rating} · {course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}K` : course.students} alumnos</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#00FF66]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
            </svg>
          </div>
          <p className="text-white text-xl font-semibold mb-2">No se encontraron cursos</p>
          <p className="text-[#888]">Prueba con otros filtros o busca otra cosa</p>
        </div>
      )}
    </div>
  );
}
