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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGithubProjects()
      .then((response) => {
        const items = response.data?.projects ?? [];
        setProjects(Array.isArray(items) ? items : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-32 rounded-2xl border border-[#2A2A2A] bg-[#111111] animate-pulse" />;
  }

  if (!projects.length) {
    return null;
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
            <span className="text-[#00FF66]">{project.stars.toLocaleString("es-ES")} stars</span>
          </div>
        </a>
      ))}
    </div>
  );
}
