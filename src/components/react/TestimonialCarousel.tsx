import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Laura García",
    role: "Frontend Developer",
    text: "CoderUp cambió mi carrera. Los cursos son super prácticos y el contenido está actualizado. En 3 meses conseguí mi primer empleo como developer.",
    avatar: "LG",
    rating: 5,
  },
  {
    name: "Carlos Ruiz",
    role: "Full Stack Developer",
    text: "La mejor plataforma de cursos que he probado. Los proyectos reales hacen que aprendas de verdad, no solo teoría. 100% recomendado.",
    avatar: "CR",
    rating: 5,
  },
  {
    name: "Ana Martínez",
    role: "Backend Developer",
    text: "Empecé desde cero y ahora trabajo como backend developer. La comunidad y los recursos son increíbles. Vale cada euro invertido.",
    avatar: "AM",
    rating: 5,
  },
  {
    name: "David López",
    role: "DevOps Engineer",
    text: "Los cursos de infraestructura y DevOps son de otro nivel. Explicaciones claras y ejercicios que simulan entornos reales de producción.",
    avatar: "DL",
    rating: 5,
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="overflow-hidden">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`transition-all duration-500 ${
              i === current ? "opacity-100 translate-y-0" : "opacity-0 absolute inset-0 translate-y-4"
            }`}
          >
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 text-center">
              <div className="flex justify-center mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg
                    key={j}
                    className="w-5 h-5 text-[#00FF66]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321 1.012l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.386a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.886a.562.562 0 01-.84-.611l1.285-5.386a.562.562 0 00-.182-.557L2.04 9.409a.563.563 0 01.321-1.012l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-white text-lg md:text-xl leading-relaxed mb-8 italic">
                "{t.text}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00FF66]/20 flex items-center justify-center text-[#00FF66] font-bold">
                  {t.avatar}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-[#888] text-sm">{t.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? "bg-[#00FF66] w-8" : "bg-[#2A2A2A] hover:bg-[#888]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
