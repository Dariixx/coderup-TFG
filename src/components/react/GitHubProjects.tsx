import { useEffect, useState } from "react";
import { getGithubProjects } from "../../lib/api";

interface Project {
  topic: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

export default function GitHubProjects() {
  const fallbackProjects: Project[] = [
    {
      topic: "astro",
      name: "withastro/astro",
      description: "Framework moderno para construir sitios rápidos con islands architecture.",
      url: "https://github.com/withastro/astro",
      stars: 0,
      language: "TypeScript",
    },
    {
      topic: "react",
      name: "facebook/react",
      description: "Biblioteca de interfaces usada por equipos profesionales en todo el mundo.",
      url: "https://github.com/facebook/react",
      stars: 0,
      language: "JavaScript",
    },
    {
      topic: "typescript",
      name: "microsoft/TypeScript",
      description: "Lenguaje tipado para crear aplicaciones mantenibles y escalables.",
      url: "https://github.com/microsoft/TypeScript",
      stars: 0,
      language: "TypeScript",
    },
  ];

  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadingFallback = window.setTimeout(() => setLoading(false), 1800);

    getGithubProjects()
      .then((response) => {
        const items = response.data?.projects ?? [];
        setProjects(Array.isArray(items) && items.length ? items : fallbackProjects);
      })
      .catch(() => setProjects(fallbackProjects))
      .finally(() => {
        window.clearTimeout(loadingFallback);
        setLoading(false);
      });

    return () => window.clearTimeout(loadingFallback);
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6" aria-label="Cargando proyectos populares">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
            <div className="mb-4 h-3 w-20 rounded-full bg-[#00FF66]/20 animate-pulse" />
            <div className="mb-3 h-5 w-2/3 rounded-full bg-[#2A2A2A] animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 rounded-full bg-[#2A2A2A] animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-[#2A2A2A] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <a
          key={project.name}
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 transition hover:-translate-y-1 hover:border-[#00FF66]/50"
        >
          <p className="text-xs uppercase tracking-widest text-[#00FF66] mb-3">{project.topic}</p>
          <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
          <p className="text-sm text-[#888] line-clamp-3 mb-5">{project.description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#E0E0E0]">{project.language}</span>
            <span className="text-[#00FF66]">{project.stars ? `${project.stars.toLocaleString("es-ES")} stars` : "Ver repo"}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
