import type { Course } from "../../lib/types";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { useOrders } from "./useOrders";

interface Props {
  courses: Course[];
}

export default function MyCoursesPage({ courses }: Props) {
  const { user, initialized } = useAuth();
  const { enrollments, updateEnrollmentProgress } = useEnrollments();
  const { orders } = useOrders();

  if (!initialized) {
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

  const purchasedCourseSlugs = new Set(orders.flatMap((order) => order.items.map((item) => item.slug)));
  const purchasedCourses = courses
    .filter((course) => purchasedCourseSlugs.has(course.slug))
    .filter((course) => !myCourses.some((item) => item.course?.slug === course.slug))
    .map((course) => ({
      enrollment: {
        id: `purchase-${course.slug}`,
        userId: user.id,
        courseId: String(course.id),
        courseTitle: course.title,
        courseSlug: course.slug,
        progress: 0,
        status: "active" as const,
        enrolledAt: new Date().toISOString(),
        lastLesson: "Acceso desbloqueado tras la compra",
      },
      course,
    }));

  const visibleCourses = [...myCourses, ...purchasedCourses];

  if (!visibleCourses.length) {
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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#2A2A2A] bg-[radial-gradient(circle_at_top_left,_rgba(0,255,102,0.10),_transparent_30%),linear-gradient(135deg,#171717_0%,#0F0F0F_100%)] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-2">Aprendizaje activo</p>
            <h2 className="text-2xl font-bold text-white">Tienes {visibleCourses.length} curso{visibleCourses.length !== 1 ? "s" : ""} con acceso</h2>
            <p className="text-[#888] mt-2">Aquí verás cursos comprados y cursos gratuitos a los que te hayas inscrito.</p>
          </div>
          <a href="/cursos" className="inline-flex rounded-xl border border-[#2A2A2A] px-5 py-3 text-white hover:border-[#00FF66]/50 transition">
            Descubrir más cursos
          </a>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
      {visibleCourses.map(({ enrollment, course }) => (
        <article key={enrollment.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] overflow-hidden">
          <div className={`h-40 bg-gradient-to-br ${course!.gradientFrom} ${course!.gradientTo} flex items-center justify-center`}>
            <div className="text-center">
              <p className="text-white font-semibold">{course!.title}</p>
              <p className="text-sm text-[#D7FFE8] mt-1">{course!.instructor.name}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <span className="rounded-full bg-[#00FF66]/10 px-3 py-1 text-xs text-[#00FF66]">{course!.category.name}</span>
              <span className="rounded-full bg-[#111111] px-3 py-1 text-xs text-[#D5D5D5]">
                {String(enrollment.id).startsWith("purchase-") ? "Compra verificada" : "Inscripción gratuita"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#888]">Progreso actual</p>
              <span className="text-sm text-[#888]">{enrollment.progress}% completado</span>
            </div>
            <div className="h-2 rounded-full bg-[#0A0A0A] overflow-hidden mb-4">
              <div className="h-full bg-[#00FF66]" style={{ width: `${enrollment.progress}%` }} />
            </div>
            <p className="text-sm text-[#888] mb-5">Última lección: {enrollment.lastLesson}</p>
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3">
                <p className="text-[#666] mb-1">Duración</p>
                <p className="text-white">{course!.duration}</p>
              </div>
              <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3">
                <p className="text-[#666] mb-1">Nivel</p>
                <p className="text-white">{course!.level}</p>
              </div>
            </div>
            {String(enrollment.id).startsWith("purchase-") ? (
              <a
                href={`/cursos/${course!.slug}`}
                className="block w-full rounded-xl bg-[#00FF66] px-5 py-3 text-center font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
              >
                Acceder al curso
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const nextProgress = Math.min(100, enrollment.progress + 20);
                  updateEnrollmentProgress(enrollment.id, {
                    progress: nextProgress,
                    lastLesson: nextProgress >= 100 ? "Curso completado" : `Lección ${Math.floor(nextProgress / 10)}`,
                    status: nextProgress >= 100 ? "completed" : "active",
                  });
                }}
                className="w-full rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
              >
                {enrollment.status === "completed" ? "Revisar curso" : "Continuar curso"}
              </button>
            )}
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}
