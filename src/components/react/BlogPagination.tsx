import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { BlogPost } from "../../lib/types";

interface Props {
  posts: BlogPost[];
  postsPerPage?: number;
}

export default function BlogPagination({ posts, postsPerPage = 6 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const categories = ["Todos", ...new Set(posts.map((p) => p.category.name))];

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = selectedCategory === "Todos" || p.category.name === selectedCategory;
      const matchSearch =
        deferredSearch === "" ||
        p.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(deferredSearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [deferredSearch, posts, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filtered.slice(startIndex, startIndex + postsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSelectedCategory("Todos");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    startTransition(() => {
      setSelectedCategory(cat);
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
      <div className="mb-10 space-y-6">
        {/* Buscador */}
        <div className="relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar artículos..."
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
      </div>

      {/* CONTADOR */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#888] text-sm">
          {filtered.length} artículo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
        {(selectedCategory !== "Todos" || searchQuery !== "") && (
          <button onClick={resetFilters} className="text-[#00FF66] text-sm hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* GRID */}
      {currentPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden hover:border-[#00FF66]/50 transition group hover:-translate-y-1 block"
            >
              <div className={`h-40 bg-gradient-to-br ${post.gradientFrom} ${post.gradientTo} flex items-center justify-center`}>
                <svg className={`w-14 h-14 ${post.iconColor} opacity-80`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#00FF66]/10 text-[#00FF66] text-xs px-2 py-1 rounded-full">{post.category.name}</span>
                  <span className="text-[#888] text-xs">{post.readingTime} min lectura</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00FF66] transition leading-tight">
                  {post.title}
                </h3>
                <p className="text-[#888] text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#00FF66]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#00FF66] text-xs font-bold">{post.author.charAt(0)}</span>
                    </div>
                    <span>{post.author}</span>
                  </div>
                  <span>{new Date(post.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-[#888] text-lg mb-4">No se encontraron artículos con esos filtros.</p>
          <button onClick={resetFilters} className="text-[#00FF66] font-semibold hover:underline">
            Ver todos los artículos
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

      {totalPages > 1 && (
        <p className="text-center text-[#888] text-sm mt-4">
          Página {currentPage} de {totalPages}
        </p>
      )}
    </div>
  );
}
