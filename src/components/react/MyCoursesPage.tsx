import type { Course } from "../../lib/types";
import { useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { getCourseImage, IMAGE_FALLBACK } from "../../lib/images";

interface Props {
  courses: Course[];
}

export default function MyCoursesPage({ courses }: Props) {
  const { user, initialized } = useAuth();
  const { enrollments, initialized: enrollmentsReady, updateEnrollmentProgress } = useEnrollments();
  const [activeLesson, setActiveLesson] = useState<{ courseSlug: string; moduleTitle: string; lesson: string; index: number } | null>(null);
  const currentCourse = activeLesson ? courses.find((course) => course.slug === activeLesson.courseSlug) : null;
  const lessonBody = useMemo(() => {
    if (!activeLesson || !currentCourse) return null;

    return {
      title: activeLesson.lesson,
      intro: `En esta lección trabajarás ${activeLesson.lesson.toLowerCase()} dentro de ${currentCourse.title}. El objetivo es entender el concepto, verlo aplicado y cerrar con una pequeña práctica.`,
      steps: [
        `Revisar el contexto del módulo "${activeLesson.moduleTitle}" y preparar el entorno de trabajo.`,
        `Seguir una explicación guiada con ejemplos reales de ${currentCourse.category.name}.`,
        "Aplicar lo aprendido en una tarea corta y marcar el progreso al terminar.",
      ],
    };
  }, [activeLesson, currentCourse]);

  if (!initialized || (user && !enrollmentsReady)) {
    return <div className="h-48 rounded-2xl border border-[#2A2A2A] bg-[#111111] animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Necesitas una cuenta para ver tus cursos</h2>
        <a href="/login" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Iniciar sesión
        </a>
      </div>
    );
  }

  const myCourses = enrollments
    .filter((item) => item.userId === user.id)
    .map((enrollment) => ({
      enrollment,
      course: courses.find((course) => course.slug === enrollment.courseSlug),
    }))
    .filter((item) => item.course);

  if (!myCourses.length) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Todavía no tienes cursos inscritos</h2>
        <p className="text-[#888] mb-6">Empieza con un curso gratuito o completa tu primera compra premium.</p>
        <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Explorar catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {myCourses.map(({ enrollment, course }) => (
        <article key={enrollment.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] overflow-hidden">
          <img
            src={course!.thumbnailUrl ?? getCourseImage(course!.category.slug, course!.id, course!.title)}
            alt={course!.title}
            className="h-40 w-full bg-[#111111] object-cover"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = IMAGE_FALLBACK;
            }}
          />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 text-xs text-[#00FF66]">{course!.category.name}</span>
              <span className="text-sm text-[#888]">{enrollment.progress}% completado</span>
            </div>
            <div className="h-2 rounded-full bg-[#0A0A0A] overflow-hidden mb-4">
              <div className="h-full bg-[#00FF66]" style={{ width: `${enrollment.progress}%` }} />
            </div>
            <p className="text-sm text-[#888] mb-5">Última lección: {enrollment.lastLesson}</p>

            <div className="mb-5 rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
              <p className="text-sm font-semibold text-white mb-3">Lecciones del curso</p>
              <div className="space-y-3">
                {(course!.curriculum ?? []).map((module, moduleIndex) => (
                  <div key={`${course!.slug}-${module.title}`}>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#00FF66] mb-2">
                      {String(moduleIndex + 1).padStart(2, "0")} · {module.title}
                    </p>
                    <ul className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li key={lesson} className="flex items-center justify-between gap-3 rounded-lg bg-[#0A0A0A] px-3 py-2 text-sm">
                          <span className="text-[#D6D6D6]">{lesson}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const totalLessons = Math.max(1, course!.curriculum?.reduce((sum, item) => sum + item.lessons.length, 0) ?? 1);
                              const completed = (course!.curriculum ?? [])
                                .slice(0, moduleIndex)
                                .reduce((sum, item) => sum + item.lessons.length, 0) + lessonIndex + 1;
                              const nextProgress = Math.min(100, Math.round((completed / totalLessons) * 100));
                              void updateEnrollmentProgress(enrollment.id, {
                                progress: nextProgress,
                                lastLesson: lesson,
                                status: nextProgress >= 100 ? "completed" : "active",
                              });
                              setActiveLesson({
                                courseSlug: course!.slug,
                                moduleTitle: module.title,
                                lesson,
                                index: completed,
                              });
                            }}
                            className="shrink-0 rounded-lg border border-[#2A2A2A] px-3 py-1 text-xs text-[#00FF66] hover:border-[#00FF66]/50 transition"
                          >
                            Abrir
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const firstModule = course!.curriculum?.[0];
                const firstLesson = firstModule?.lessons[0] ?? enrollment.lastLesson;
                const nextProgress = Math.max(enrollment.progress, firstLesson ? Math.round(100 / Math.max(1, course!.totalLessons ?? course!.lessons ?? 1)) : enrollment.progress);
                void updateEnrollmentProgress(enrollment.id, {
                  progress: nextProgress,
                  lastLesson: firstLesson,
                  status: nextProgress >= 100 ? "completed" : "active",
                });
                setActiveLesson({
                  courseSlug: course!.slug,
                  moduleTitle: firstModule?.title ?? "Contenido del curso",
                  lesson: firstLesson,
                  index: 1,
                });
              }}
              className="w-full rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
            >
              {enrollment.status === "completed" ? "Revisar contenido" : "Abrir curso"}
            </button>
          </div>
        </article>
        ))}
      </div>

      <aside className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 xl:sticky xl:top-24 xl:self-start">
        {lessonBody && currentCourse && activeLesson ? (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img
                src={currentCourse.thumbnailUrl ?? getCourseImage(currentCourse.category.slug, currentCourse.id, currentCourse.title)}
                alt={currentCourse.title}
                className="h-16 w-24 rounded-xl object-cover"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src = IMAGE_FALLBACK;
                }}
              />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#00FF66]">{currentCourse.title}</p>
                <h2 className="text-lg font-bold text-white">{lessonBody.title}</h2>
              </div>
            </div>
            <p className="text-sm leading-6 text-[#B0B0B0]">{lessonBody.intro}</p>
            <div className="mt-6 space-y-3">
              {lessonBody.steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
                  <p className="text-xs text-[#00FF66] mb-1">Paso {index + 1}</p>
                  <p className="text-sm leading-6 text-[#D6D6D6]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#00FF66] mb-3">Lector de lecciones</p>
            <h2 className="text-xl font-bold text-white mb-3">Abre cualquier lección del temario</h2>
            <p className="text-sm leading-6 text-[#888]">Desde aquí podrás leer el contenido del curso, moverte por sus módulos y guardar progreso sin depender solo del botón de continuar.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
