import { useEffect, useState, type FormEvent } from "react";
import { updateCurrentUser } from "../../lib/auth";
import { API_ENDPOINTS, apiFetch } from "../../lib/api";
import type { Enrollment, Order } from "../../lib/types";
import { formatDate, generateInitials } from "../../lib/utils";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { useOrders } from "./useOrders";

export default function AccountDashboard() {
  const { user, initialized, logoutUser } = useAuth();
  const { enrollments, initialized: enrollmentsReady } = useEnrollments();
  const { orders, initialized: ordersReady } = useOrders();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

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

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    if (profileForm.name.trim().length < 2) {
      setProfileStatus("error");
      setProfileMessage("Completa tu nombre con al menos 2 caracteres.");
      return;
    }

    if (!profileForm.email.includes("@") || !profileForm.email.includes(".")) {
      setProfileStatus("error");
      setProfileMessage("Introduce un email válido, por ejemplo nombre@dominio.com.");
      return;
    }

    setProfileStatus("loading");
    const result = await apiFetch<any>(API_ENDPOINTS.users.updateProfile, {
      method: "POST",
      body: {
        name: profileForm.name,
        email: profileForm.email,
      },
    });

    if (!result.ok) {
      setProfileStatus("error");
      setProfileMessage(result.message);
      return;
    }

    updateCurrentUser({
      name: result.data.user?.name ?? result.data.name ?? profileForm.name.trim(),
      email: result.data.user?.email ?? result.data.email ?? profileForm.email.trim().toLowerCase(),
    });
    setProfileStatus("success");
    setProfileMessage("Perfil actualizado correctamente.");
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");

    if (passwordForm.currentPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordMessage("Introduce tu contraseña actual.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordStatus("error");
      setPasswordMessage("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setPasswordStatus("loading");
    const result = await apiFetch(API_ENDPOINTS.auth.changePassword, {
      method: "POST",
      body: {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      },
    });

    if (!result.ok) {
      setPasswordStatus("error");
      setPasswordMessage(result.message);
      return;
    }

    setPasswordForm({ currentPassword: "", newPassword: "" });
    setPasswordStatus("success");
    setPasswordMessage("Contraseña actualizada correctamente.");
  };

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

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Datos personales</h2>
            <p className="mt-1 text-sm text-[#888]">Actualiza el nombre y email asociados a tu cuenta.</p>
          </div>
          <label className="block space-y-2 text-sm text-[#888]">
            <span>Nombre</span>
            <input
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#00FF66]"
            />
          </label>
          <label className="block space-y-2 text-sm text-[#888]">
            <span>Email</span>
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#00FF66]"
            />
          </label>
          <button
            type="submit"
            disabled={profileStatus === "loading"}
            className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
          >
            {profileStatus === "loading" ? "Guardando..." : "Guardar datos"}
          </button>
          {profileMessage && (
            <p role={profileStatus === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${profileStatus === "error" ? "bg-red-500/10 text-red-300" : "bg-[#00FF66]/10 text-[#9CFFBF]"}`}>
              {profileMessage}
            </p>
          )}
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Cambio de contraseña</h2>
            <p className="mt-1 text-sm text-[#888]">Confirma tu contraseña actual antes de definir una nueva.</p>
          </div>
          <label className="block space-y-2 text-sm text-[#888]">
            <span>Contraseña actual</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#00FF66]"
              autoComplete="current-password"
            />
          </label>
          <label className="block space-y-2 text-sm text-[#888]">
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#00FF66]"
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={passwordStatus === "loading"}
            className="rounded-xl bg-[#00FF66] px-5 py-3 font-semibold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
          >
            {passwordStatus === "loading" ? "Actualizando..." : "Cambiar contraseña"}
          </button>
          {passwordMessage && (
            <p role={passwordStatus === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${passwordStatus === "error" ? "bg-red-500/10 text-red-300" : "bg-[#00FF66]/10 text-[#9CFFBF]"}`}>
              {passwordMessage}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
