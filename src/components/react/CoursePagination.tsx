import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { Course } from "../../lib/types";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "../../lib/utils";
import { getCourses } from "../../lib/content";

interface Props {
  cursos: Course[];
  cursosPerPage?: number;
}

export default function CoursePagination({ cursos, cursosPerPage = 6 }: Props) {
  const [loadedCursos, setLoadedCursos] = useState(cursos);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    if (loadedCursos.length > 0) return;

    getCourses()
      .then((items) => setLoadedCursos(items))
      .catch(() => setLoadError("No se han podido cargar los cursos desde MySQL."));
  }, [loadedCursos.length]);

  const categories = ["Todos", ...new Set(loadedCursos.map((c) => c.category.name))];
  const levels = ["Todos", ...new Set(loadedCursos.map((c) => c.level))];

  const filtered = useMemo(() => {
    return loadedCursos.filter((c) => {
      const matchCategory = selectedCategory === "Todos" || c.category.name === selectedCategory;
      const matchLevel = selectedLevel === "Todos" || c.level === selectedLevel;
      const matchSearch =
        deferredSearch === "" ||
        c.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(deferredSearch.toLowerCase());
      return matchCategory && matchLevel && matchSearch;
    });
  }, [loadedCursos, deferredSearch, selectedCategory, selectedLevel]);

  const totalPages = Math.ceil(filtered.length / cursosPerPage);
  const startIndex = (currentPage - 1) * cursosPerPage;
  const currentCursos = filtered.slice(startIndex, startIndex + cursosPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSelectedLevel("Todos");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Reset page when filters change
  const handleCategoryChange = (cat: string) => {
    startTransition(() => {
      setSelectedCategory(cat);
      setCurrentPage(1);
    });
  };

  const handleLevelChange = (lvl: string) => {
    startTransition(() => {
      setSelectedLevel(lvl);
      setCurrentPage(1);
    });
  };

  const handleSearchChange = (val: string) => {
    startTransition(() => {
      setSearchQuery(val);
      setCurrentPage(1);
    });
  };

  return (
    <div>
      {/* FILTROS */}
      {loadError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      )}

      <div className="mb-10 space-y-6">
        {/* Buscador */}
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#888] focus:border-[#00FF66]/50 focus:outline-none transition"
          />
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "bg-[#00FF66] text-[#0A0A0A]"
                  : "bg-[#1A1A1A] text-[#888] border border-[#2A2A2A] hover:border-[#00FF66]/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Niveles */}
        <div className="flex flex-wrap gap-2 justify-center">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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

      {/* CONTADOR */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#888] text-sm">
          {filtered.length} curso{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
        {(selectedCategory !== "Todos" || selectedLevel !== "Todos" || searchQuery !== "") && (
          <button onClick={resetFilters} className="text-[#00FF66] text-sm hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* GRID DE CURSOS */}
      {currentCursos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentCursos.map((curso) => (
            <article
              key={curso.slug}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#00FF66]/50 transition group hover:-translate-y-1"
            >
              <a href={`/cursos/${curso.slug}`} className="block">
              <div className={`h-44 bg-gradient-to-br ${curso.gradientFrom} ${curso.gradientTo} flex items-center justify-center`}>
                <svg className={`w-16 h-16 ${curso.iconColor} opacity-80`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="bg-[#00FF66]/10 text-[#00FF66] text-xs px-2 py-1 rounded-full">{curso.category.name}</span>
                  <span className="bg-[#00FF66]/10 text-[#00FF66] text-xs px-2 py-1 rounded-full">{curso.level}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${curso.isFree ? "bg-[#00FF66]/10 text-[#00FF66]" : "bg-[#2A2A2A] text-white"}`}>
                    {curso.isFree ? "Gratis" : formatPrice(curso.price)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00FF66] transition">{curso.title}</h3>
                <p className="text-[#888] text-sm mb-4">{curso.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#00FF66] font-bold text-lg">{curso.instructor.name}</span>
                  <div className="flex items-center gap-1 text-sm text-[#888]">
                    <svg className="w-4 h-4 text-[#00FF66]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{curso.rating} · {curso.students}</span>
                  </div>
                </div>
              </div>
              </a>
              <div className="px-6 pb-6">
                <AddToCartButton
                  item={{
                    courseId: String(curso.id),
                    slug: curso.slug,
                    title: curso.title,
                    price: curso.price,
                    thumbnailUrl: curso.thumbnailUrl,
                    instructorName: curso.instructor.name,
                    isFree: curso.isFree,
                    accessType: curso.accessType,
                    icon: curso.icon,
                    iconColor: curso.iconColor,
                    gradientFrom: curso.gradientFrom,
                    gradientTo: curso.gradientTo,
                    category: curso.category.name,
                  }}
                  course={curso}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-[#888] text-lg mb-4">No se encontraron cursos con esos filtros.</p>
          <button onClick={resetFilters} className="text-[#00FF66] font-semibold hover:underline">
            Ver todos los cursos
          </button>
        </div>
      )}

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] hover:border-[#00FF66]/50 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-xl font-semibold transition flex items-center justify-center ${
                currentPage === page
                  ? "bg-[#00FF66] text-[#0A0A0A]"
                  : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] hover:border-[#00FF66]/50 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] hover:border-[#00FF66]/50 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* INFO PÁGINA */}
      {totalPages > 1 && (
        <p className="text-center text-[#888] text-sm mt-4">
          Página {currentPage} de {totalPages}
        </p>
      )}
    </div>
  );
}
