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
          <p className="text-3xl font-bold text-white">Preparado</p>
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
    </div>
  );
}
