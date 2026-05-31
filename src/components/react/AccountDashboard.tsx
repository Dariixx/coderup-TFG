import type { Enrollment, Order } from "../../lib/types";
import { getFavorites, subscribeFavorites, type FavoriteCourse } from "../../lib/favorites";
import { formatDate, formatPrice, generateInitials } from "../../lib/utils";
import { useEffect, useState } from "react";
import CouponsPanel from "./CouponsPanel";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { useOrders } from "./useOrders";

export default function AccountDashboard() {
  const { user, initialized, logoutUser } = useAuth();
  const { enrollments, initialized: enrollmentsReady } = useEnrollments();
  const { orders, initialized: ordersReady } = useOrders();
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const sync = () => setFavorites(getFavorites(user.id));
    sync();
    return subscribeFavorites(sync);
  }, [user?.id]);

  if (!initialized || (user && (!enrollmentsReady || !ordersReady))) {
    return <div className="h-40 rounded-2xl border border-[#2A2A2A] bg-[#111111] animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Tu cuenta aún no está activa</h2>
        <p className="text-[#888] mb-6">Inicia sesión o crea una cuenta para acceder a tus cursos, pedidos y ventajas freemium.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/login" className="rounded-xl border border-[#2A2A2A] px-6 py-3 text-white hover:border-[#00FF66]/50 transition">
            Iniciar sesión
          </a>
          <a href="/register" className="rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
            Crear cuenta
          </a>
        </div>
      </div>
    );
  }

  const myEnrollments = enrollments.filter((item: Enrollment) => item.userId === user.id);
  const myOrders = orders.filter((item: Order) => item.userId === user.id);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00FF66]/10 text-[#00FF66] flex items-center justify-center font-bold text-xl">
            {generateInitials(user.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-[#888]">{user.email}</p>
            <p className="text-xs text-[#666] mt-1">Cuenta creada el {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {user.role === "admin" && (
            <a href="/admin" className="rounded-xl border border-[#2A2A2A] px-5 py-3 text-white hover:border-[#00FF66]/50 transition">
              Panel admin
            </a>
          )}
          {user.role === "editor" && (
            <a href="/admin/cursos" className="rounded-xl border border-[#2A2A2A] px-5 py-3 text-white hover:border-[#00FF66]/50 transition">
              Gestionar cursos
            </a>
          )}
          <a href="/mi-cuenta/mis-cursos" className="rounded-xl border border-[#2A2A2A] px-5 py-3 text-white hover:border-[#00FF66]/50 transition">
            Mis cursos
          </a>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              window.location.href = "/";
            }}
            className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
        <a href="/mi-cuenta/mis-cursos" className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#00FF66]/50 transition">
          <p className="text-[#888] text-sm mb-2">Mis cursos</p>
          <p className="text-3xl font-bold text-white">{myEnrollments.length}</p>
        </a>
        <a href="/mi-cuenta/pedidos" className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#00FF66]/50 transition">
          <p className="text-[#888] text-sm mb-2">Pedidos</p>
          <p className="text-3xl font-bold text-white">{myOrders.length}</p>
        </a>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Favoritos</p>
          <p className="text-3xl font-bold text-white">{favorites.length}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Certificados</p>
          <p className="text-3xl font-bold text-white">Próximamente</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Ajustes de cuenta</p>
          <p className="text-lg font-semibold text-white">{user.usedWelcomeCoupon ? "Cupón usado" : "Cupón disponible"}</p>
        </div>
      </section>

      <CouponsPanel />

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-[#00FF66]">Favoritos</p>
            <h2 className="text-2xl font-bold text-white">Cursos guardados</h2>
          </div>
          <a href="/cursos" className="rounded-xl border border-[#2A2A2A] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#00FF66]/50">
            Explorar
          </a>
        </div>
        {favorites.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111] p-4 text-sm text-[#888]">
            Cuando marques cursos con el corazón, aparecerán aquí.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((course) => (
              <a key={course.slug} href={`/cursos/${course.slug}`} className="group overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111111] transition hover:-translate-y-0.5 hover:border-[#00FF66]/45">
                {course.thumbnailUrl && <img src={course.thumbnailUrl} alt={course.title} className="h-32 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />}
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#00FF66]/10 px-2 py-1 text-xs text-[#00FF66]">{course.category}</span>
                    <span className="rounded-full bg-[#2A2A2A] px-2 py-1 text-xs text-white">{course.level}</span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-[#00FF66]">{course.title}</h3>
                  <p className="mt-1 text-xs text-[#888]">{course.instructorName}</p>
                  <p className="mt-3 font-bold text-[#00FF66]">{formatPrice(course.price)}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
