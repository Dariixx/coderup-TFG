import { useEffect, useMemo, useState } from "react";

interface Heading {
  id: string;
  title: string;
  level: number;
}

interface Props {
  content: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: number;
  publishedDate: string;
  category: string;
  coverUrl?: string;
}

export default function BlogContent({ content, title, excerpt, author, readTime, publishedDate, category, coverUrl }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  const authorInitial = useMemo(() => author.trim().charAt(0).toUpperCase() || "C", [author]);

  useEffect(() => {
    const article = document.getElementById("blog-article");
    if (!article) {
      return;
    }

    const nextHeadings = Array.from(article.querySelectorAll("h2, h3")).map((heading, index) => {
      const id = `section-${index}-${(heading.textContent ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      heading.id = id;
      return {
        id,
        title: heading.textContent ?? "",
        level: Number(heading.tagName.slice(1)),
      };
    });

    const firstSection = article.querySelector("h2:nth-of-type(2)");
    if (firstSection && !article.querySelector("[data-blog-inline-cta]")) {
      const cta = document.createElement("aside");
      cta.dataset.blogInlineCta = "true";
      cta.className = "blog-inline-cta";
      cta.innerHTML = `
        <p class="blog-inline-cta__eyebrow">Sigue practicando</p>
        <p class="blog-inline-cta__title">Convierte esta lectura en un proyecto real.</p>
        <a href="/cursos">Ver cursos relacionados</a>
      `;
      firstSection.before(cta);
    }

    setHeadings(nextHeadings);
  }, [content]);

  return (
    <main className="bg-[#0A0A0A] text-[#E0E0E0]">
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,102,0.08),transparent_38%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/blog" className="mb-8 inline-flex text-sm text-[#888] transition hover:text-[#00FF66]">
            Volver al blog
          </a>
          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 font-medium text-[#00FF66]">{category}</span>
            <span className="text-[#888]">{readTime} min lectura</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">{title}</h1>
          <p className="text-lg md:text-xl text-[#B0B0B0] leading-8 mb-8">{excerpt}</p>
          <div className="flex items-center gap-4 border-b border-[#2A2A2A] pb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00FF66]/15 font-bold text-[#00FF66]">{authorInitial}</div>
            <div>
              <p className="font-semibold text-white">{author}</p>
              <p className="text-sm text-[#888]">{publishedDate}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="h-72 md:h-96 w-full rounded-2xl border border-[#2A2A2A] object-cover" />
          ) : (
            <div className="h-72 md:h-96 rounded-2xl border border-[#2A2A2A] bg-[linear-gradient(135deg,rgba(0,255,102,0.16),rgba(59,130,246,0.14)),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_30%)]" />
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_280px] gap-12">
          <article id="blog-article" className="blog-article" dangerouslySetInnerHTML={{ __html: content }} />

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {headings.length > 0 && (
                <nav className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">En este artículo</h2>
                  <div className="space-y-3">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm transition hover:text-[#00FF66] ${heading.level === 3 ? "pl-4 text-[#777]" : "text-[#B0B0B0]"}`}
                      >
                        {heading.title}
                      </a>
                    ))}
                  </div>
                </nav>
              )}

              <div className="rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 p-6">
                <p className="mb-2 text-sm font-bold text-white">Aprende construyendo</p>
                <p className="mb-4 text-sm leading-6 text-[#888]">Nuestros cursos llevan estos conceptos a ejercicios y proyectos prácticos.</p>
                <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-4 py-2 text-sm font-bold text-[#0A0A0A] hover:bg-[#00CC52] transition">
                  Ver cursos
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
