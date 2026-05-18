import type { Course } from "../../lib/types";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { getCourseImage, IMAGE_FALLBACK } from "../../lib/images";

interface Props {
  courses: Course[];
}

export default function MyCoursesPage({ courses }: Props) {
  const { user, initialized } = useAuth();
  const { enrollments, initialized: enrollmentsReady, updateEnrollmentProgress } = useEnrollments();

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
                            }}
                            className="shrink-0 rounded-lg border border-[#2A2A2A] px-3 py-1 text-xs text-[#00FF66] hover:border-[#00FF66]/50 transition"
                          >
                            Ver lección
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
                const nextProgress = Math.min(100, enrollment.progress + 20);
                void updateEnrollmentProgress(enrollment.id, {
                  progress: nextProgress,
                  lastLesson: nextProgress >= 100 ? "Curso completado" : `Lección ${Math.floor(nextProgress / 10)}`,
                  status: nextProgress >= 100 ? "completed" : "active",
                });
              }}
              className="w-full rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
            >
              {enrollment.status === "completed" ? "Revisar curso" : "Continuar curso"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
