import { useEffect, useState } from "react";
import type { Course } from "../../lib/types";
import { courseToFavorite, isFavorite, subscribeFavorites, toggleFavorite } from "../../lib/favorites";
import { useAuth } from "./useAuth";

interface Props {
  course: Course;
  compact?: boolean;
}

export default function FavoriteButton({ course, compact = false }: Props) {
  const { user, initialized } = useAuth();
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!initialized || !user) {
      setActive(false);
      return;
    }

    const sync = () => setActive(isFavorite(course.slug, user.id));
    sync();
    return subscribeFavorites(sync);
  }, [course.slug, initialized, user?.id]);

  if (!initialized || !user) {
    return null;
  }

  const handleClick = () => {
    const nextActive = toggleFavorite(courseToFavorite(course), user.id);
    setActive(nextActive);
    setMessage(nextActive ? "Guardado" : "Quitado");
    window.setTimeout(() => setMessage(""), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border transition hover:-translate-y-0.5 ${
        active
          ? "border-[#00FF66]/50 bg-[#00FF66]/15 text-[#00FF66]"
          : "border-[#2A2A2A] bg-[#111111] text-[#888] hover:border-[#00FF66]/50 hover:text-[#00FF66]"
      } ${compact ? "h-10 w-10" : "px-4 py-3 text-sm font-semibold"}`}
      aria-label={active ? `Quitar ${course.title} de favoritos` : `Añadir ${course.title} a favoritos`}
      title={message || (active ? "Quitar de favoritos" : "Añadir a favoritos")}
    >
      <svg className="h-5 w-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0 6.75-9 11.25-9 11.25S3 15 3 8.25A4.75 4.75 0 0 1 11.25 5 4.75 4.75 0 0 1 21 8.25Z" />
      </svg>
      {!compact && <span>{message || (active ? "Favorito" : "Guardar")}</span>}
    </button>
  );
}
