import { useEffect, useMemo, useState } from "react";
import { getCourseBySlug, getCourses } from "../../lib/content";
import { getCourseImage, getInstructorAvatar, IMAGE_FALLBACK } from "../../lib/images";
import type { Course } from "../../lib/types";
import { formatPrice } from "../../lib/utils";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

interface Props {
  slug?: string;
  initialCourse?: Course | null;
  initialRelated?: Course[];
}

function cartItem(course: Course) {
  return {
    courseId: String(course.id),
    slug: course.slug,
    title: course.title,
    price: course.price,
    thumbnailUrl: course.thumbnailUrl,
    instructorName: course.instructor.name,
    isFree: course.isFree,
    accessType: course.accessType,
    icon: course.icon,
    iconColor: course.iconColor,
    gradientFrom: course.gradientFrom,
    gradientTo: course.gradientTo,
    category: course.category.name,
  };
}

export default function LiveCourseDetail({ slug, initialCourse = null, initialRelated = [] }: Props) {
  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [related, setRelated] = useState<Course[]>(initialRelated);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(initialCourse ? "ready" : "loading");

  const resolvedSlug = useMemo(() => {
    if (slug) return slug;
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("slug") ?? "";
  }, [slug]);

  useEffect(() => {
    if (!resolvedSlug) {
      setStatus("error");
      return;
    }

    let active = true;
    setStatus(initialCourse ? "ready" : "loading");

    Promise.all([getCourseBySlug(resolvedSlug), getCourses()])
      .then(([freshCourse, courses]) => {
        if (!active) return;
        if (!freshCourse) {
          setStatus("error");
          return;
        }
        setCourse(freshCourse);
        setRelated(courses.filter((item) => item.slug !== freshCourse.slug).slice(0, 3));
        setStatus("ready");
      })
      .catch(() => {
        if (active && !course) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [resolvedSlug]);

  if (status === "loading") {
    return (
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl border border-[#2A2A2A] bg-[#111111]" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Curso no encontrado</h1>
          <p className="mb-8 text-[#888]">No hemos podido localizar este curso en el catálogo publicado.</p>
          <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] transition hover:bg-[#00CC52]">
            Ver catálogo
          </a>
        </div>
      </main>
    );
  }

  const temario = course.curriculum ?? [];
  const requisitos = course.requirements ?? [];
  const aprenderas = course.whatYouLearn ?? [];
  const courseImage = course.thumbnailUrl ?? getCourseImage(course.category.slug, course.id, course.title);
  const instructorImage = course.instructor.avatarUrl ?? course.instructor.avatar?.url ?? getInstructorAvatar(course.instructor.id);
  const hasRating = Number(course.rating) > 0;

  return (
    <main>
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF66]/5 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <a href="/cursos" className="mb-6 inline-flex text-sm text-[#888] transition hover:text-[#00FF66]">Volver a cursos</a>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 text-xs font-medium text-[#00FF66]">{course.category.name}</span>
                <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 text-xs font-medium text-[#00FF66]">{course.level}</span>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{course.title}</h1>
              <p className="mb-6 text-lg leading-8 text-[#888]">{course.description}</p>
              <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-[#888]">
                <span><strong className="text-white">{hasRating ? course.rating.toFixed(1) : "Sin valoraciones"}</strong> ({course.students} estudiantes)</span>
                <span>{course.duration}</span>
                <span>{course.lessons} lecciones</span>
                <span>{formatPrice(course.price)}</span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <AddToCartButton size="large" item={cartItem(course)} course={course} />
                <FavoriteButton course={course} />
                <a href="#temario" className="inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] px-8 py-4 text-lg font-bold text-white transition hover:border-[#00FF66]/50">
                  Ver temario
                </a>
              </div>
            </div>
            <img
              src={courseImage}
              alt={course.title}
              className="hidden h-80 w-full rounded-2xl border border-[#2A2A2A] object-cover shadow-2xl shadow-black/30 lg:block"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = IMAGE_FALLBACK;
              }}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-12 lg:col-span-2">
            <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Lo que aprenderás</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {aprenderas.map((item) => <p key={item} className="text-sm text-[#B0B0B0]">✓ {item}</p>)}
              </div>
            </section>

            <section id="temario">
              <h2 className="mb-6 text-2xl font-bold text-white">Temario del curso</h2>
              <div className="space-y-3">
                {temario.map((module, index) => (
                  <article key={`${module.title}-${index}`} className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5 transition hover:border-[#00FF66]/30">
                    <div className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00FF66]/10 text-sm font-bold text-[#00FF66]">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-semibold text-white">{module.title}</h3>
                        <ul className="mt-2 space-y-1">
                          {module.lessons.map((lesson) => <li key={lesson} className="text-sm text-[#888]">• {lesson}</li>)}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Requisitos previos</h2>
              <div className="space-y-3">
                {(requisitos.length ? requisitos : ["Sin requisitos previos"]).map((item) => <p key={item} className="text-sm text-[#B0B0B0]">› {item}</p>)}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8">
              <div className="mb-6 rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#888]">Instructor</p>
                <div className="flex items-center gap-3">
                  <img src={instructorImage} alt={course.instructor.name} className="h-14 w-14 rounded-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.src = IMAGE_FALLBACK; }} />
                  <div>
                    <p className="font-semibold text-white">{course.instructor.name}</p>
                    <p className="text-sm text-[#00FF66]">{course.instructor.specialty ?? course.instructor.role}</p>
                  </div>
                </div>
              </div>
              <p className="mb-6 text-center text-4xl font-bold text-white">{formatPrice(course.price)}</p>
              <AddToCartButton size="large" item={cartItem(course)} course={course} />
              <div className="mt-6 space-y-3 border-t border-[#2A2A2A] pt-6 text-sm text-[#888]">
                <p>Nivel: {course.level}</p>
                <p>Duración: {course.duration}</p>
                <p>Lecciones: {course.lessons}</p>
                <p>Temario: {temario.length} módulos</p>
                <p>Valoración: {hasRating ? course.rating.toFixed(1) : "sin valoraciones"}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#2A2A2A] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white">También te puede interesar</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((item) => (
              <a key={item.slug} href={`/cursos/detalle?slug=${encodeURIComponent(item.slug)}`} className="group block overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] transition hover:-translate-y-1 hover:border-[#00FF66]/50">
                <img src={item.thumbnailUrl ?? getCourseImage(item.category.slug, item.id, item.title)} alt={item.title} className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="p-5">
                  <span className="rounded-full bg-[#00FF66]/10 px-2 py-1 text-xs text-[#00FF66]">{item.category.name}</span>
                  <h3 className="mt-3 font-bold text-white transition group-hover:text-[#00FF66]">{item.title}</h3>
                  <p className="mt-3 font-bold text-[#00FF66]">{formatPrice(item.price)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
