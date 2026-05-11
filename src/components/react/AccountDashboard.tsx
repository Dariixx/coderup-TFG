import type { Enrollment, Order } from "../../lib/types";
import { formatDate, generateInitials } from "../../lib/utils";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { useOrders } from "./useOrders";

export default function AccountDashboard() {
  const { user, initialized, logoutUser } = useAuth();
  const { enrollments } = useEnrollments();
  const { orders } = useOrders();

  if (!initialized) {
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
  const purchasedCourseCount = new Set(myOrders.flatMap((order) => order.items.map((item) => item.slug))).size;
  const learningCount = Math.max(myEnrollments.length, purchasedCourseCount);
  const latestOrder = myOrders[0];

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#2A2A2A] bg-[radial-gradient(circle_at_top_left,_rgba(0,255,102,0.12),_transparent_35%),linear-gradient(135deg,#181818_0%,#101010_100%)] p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00FF66]/10 text-[#00FF66] flex items-center justify-center font-bold text-xl">
            {generateInitials(user.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-[#888]">{user.email}</p>
            <p className="text-xs text-[#666] mt-1">
              {user.createdAt ? `Cuenta creada el ${formatDate(user.createdAt)}` : `Rol actual: ${user.role}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {["admin", "editor"].includes(user.role) && (
            <a href="/admin" className="rounded-xl border border-[#00FF66]/30 px-5 py-3 text-[#9CFFBF] hover:border-[#00FF66]/60 hover:text-white transition">
              Ir al panel admin
            </a>
          )}
          <a href="/mi-cuenta/mis-cursos" className="rounded-xl border border-[#2A2A2A] px-5 py-3 text-white hover:border-[#00FF66]/50 transition">
            Mis cursos
          </a>
          <button
            type="button"
            onClick={() => {
              logoutUser().finally(() => {
                window.location.href = "/";
              });
            }}
            className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
        <a href="/mi-cuenta/mis-cursos" className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#00FF66]/50 transition">
          <p className="text-[#888] text-sm mb-2">Cursos activos</p>
          <p className="text-3xl font-bold text-white">{learningCount}</p>
        </a>
        <a href="/mi-cuenta/pedidos" className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 hover:border-[#00FF66]/50 transition">
          <p className="text-[#888] text-sm mb-2">Pedidos</p>
          <p className="text-3xl font-bold text-white">{myOrders.length}</p>
        </a>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Última compra</p>
          <p className="text-lg font-semibold text-white">{latestOrder ? latestOrder.orderNumber : "Sin pedidos"}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Ruta sugerida</p>
          <p className="text-lg font-semibold text-white">{myOrders.length ? "Seguir aprendiendo" : "Haz tu primera compra"}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-[#888] text-sm mb-2">Rol de acceso</p>
          <p className="text-lg font-semibold text-white capitalize">{user.role}</p>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-2">Actividad</p>
              <h3 className="text-2xl font-bold text-white">Tu progreso en CoderUp</h3>
            </div>
            <a href="/mi-cuenta/mis-cursos" className="text-sm text-[#00FF66] hover:text-white transition">
              Ver cursos
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-5">
              <p className="text-sm text-[#888] mb-2">Cursos con acceso</p>
              <p className="text-3xl font-bold text-white">{learningCount}</p>
            </div>
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-5">
              <p className="text-sm text-[#888] mb-2">Pedidos completados</p>
              <p className="text-3xl font-bold text-white">{myOrders.length}</p>
            </div>
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-5">
              <p className="text-sm text-[#888] mb-2">Sesión</p>
              <p className="text-lg font-semibold text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#121212] to-[#0C0C0C] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-3">Siguiente paso</p>
          <h3 className="text-2xl font-bold text-white mb-3">
            {myOrders.length ? "Revisa tus cursos y continúa tu progreso." : "Explora el catálogo y activa tu primera compra."}
          </h3>
          <p className="text-[#888] mb-5">
            {myOrders.length
              ? "Tu cuenta ya está conectada al backend y puede recuperar pedidos reales desde MySQL."
              : "El flujo de carrito, checkout y pedidos ya está integrado con el backend PHP para que puedas demostrarlo en la defensa."}
          </p>
          <a
            href={myOrders.length ? "/mi-cuenta/mis-cursos" : "/cursos"}
            className="inline-flex rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition"
          >
            {myOrders.length ? "Abrir mis cursos" : "Explorar cursos"}
          </a>
        </div>
      </section>
    </div>
  );
}
