import { useEffect, useState } from "react";
import type { BlogPost } from "../../lib/types";
import { getBlogImage, IMAGE_FALLBACK } from "../../lib/images";

interface DevArticle {
  id: number;
  title: string;
  description?: string;
  url: string;
  cover_image?: string | null;
  readable_publish_date?: string;
  user?: {
    name?: string;
  };
}

interface Props {
  fallbackPosts: BlogPost[];
}

export default function DevToArticles({ fallbackPosts }: Props) {
  const [articles, setArticles] = useState<DevArticle[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetch("https://dev.to/api/articles?tag=programming&per_page=6", {
      headers: { Accept: "application/vnd.forem.api-v1+json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("DEV.to no disponible");
        return response.json() as Promise<DevArticle[]>;
      })
      .then((items) => {
        setArticles(items.slice(0, 6));
        setUsingFallback(false);
      })
      .catch(() => {
        console.log("API no disponible, mostrando contenido propio");
        setUsingFallback(true);
      });
  }, []);

  const cards = usingFallback
    ? fallbackPosts.slice(0, 6).map((post) => ({
        id: Number(post.id),
        title: post.title,
        description: post.excerpt,
        url: `/blog/${post.slug}`,
        cover_image: post.cover?.url ?? getBlogImage(post.category.slug, post.id, post.title),
        readable_publish_date: new Date(post.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        user: { name: post.author },
      }))
    : articles;

  if (cards.length === 0) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-[#00FF66]">API externa</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-white">Lecturas reales de DEV.to</h2>
        </div>
        <p className="max-w-xl text-sm text-[#888]">
          Articulos de programacion cargados desde una API publica. Si el servicio no responde, se muestra contenido propio.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((article, index) => (
          <a
            key={`${article.id}-${index}`}
            href={article.url}
            target={article.url.startsWith("http") ? "_blank" : undefined}
            rel={article.url.startsWith("http") ? "noreferrer" : undefined}
            className="group overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] transition hover:-translate-y-1 hover:border-[#00FF66]/50"
          >
            <img
              src={article.cover_image ?? getBlogImage("programming", article.id, article.title)}
              alt={article.title}
              className="h-44 w-full bg-[#111111] object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = IMAGE_FALLBACK;
              }}
            />
            <div className="p-5">
              <p className="mb-3 text-xs text-[#888]">
                {article.user?.name ?? "DEV Community"} · {article.readable_publish_date ?? "Reciente"}
              </p>
              <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-[#00FF66]">{article.title}</h3>
              {article.description && <p className="mt-3 line-clamp-2 text-sm text-[#888]">{article.description}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
