import { useEffect, useState, type FormEvent } from "react";
import { loginUser, logoutUser } from "../../../lib/auth";
import { useAuth } from "../useAuth";
import AdminCoursesManager from "./AdminCoursesManager";
import AdminOrdersManager from "./AdminOrdersManager";
import AdminStats from "./AdminStats";
import AdminUsersManager from "./AdminUsersManager";
import CouponsPanel from "../CouponsPanel";

type AdminTab = "resumen" | "cursos" | "usuarios" | "pedidos" | "cupones";

const tabs: Array<{ id: AdminTab; label: string; description: string }> = [
  { id: "resumen", label: "Resumen", description: "Metricas principales" },
  { id: "cursos", label: "Cursos", description: "Crear, editar y eliminar" },
  { id: "usuarios", label: "Usuarios", description: "Roles y accesos" },
  { id: "pedidos", label: "Pedidos", description: "Compras y cupones" },
  { id: "cupones", label: "Cupones", description: "Disponibles por rol" },
];

export default function AdminPanel() {
  const { user, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isEditor = user?.role === "editor";
  const isStaff = isAdmin || isEditor;
  const visibleTabs = isAdmin ? tabs : tabs.filter((tab) => tab.id === "cursos");

  useEffect(() => {
    if (isEditor && activeTab !== "cursos") {
      setActiveTab("cursos");
    }
  }, [activeTab, isEditor]);

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const result = await loginUser({ email, password });
    setLoading(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (!["admin", "editor"].includes(result.user.role)) {
      await logoutUser();
      setMessage("Esta zona es solo para perfiles admin o editor.");
      return;
    }

    setEmail("");
    setPassword("");
    setActiveTab(result.user.role === "editor" ? "cursos" : "resumen");
  };

  const handleLogout = async () => {
    await logoutUser();
    setActiveTab("resumen");
  };

  if (!initialized) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-[#888]">
        Cargando acceso de administracion...
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
        <section className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-4">Panel interno</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5">Acceso privado</h1>
            <p className="text-[#888] text-lg leading-relaxed">
              Entra con una cuenta admin o editor. Admin controla toda la plataforma; editor gestiona el catalogo de cursos.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-4">
              <p className="text-white font-semibold">Cursos</p>
              <p className="text-[#777]">Contenido y catalogo</p>
            </div>
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-4">
              <p className="text-white font-semibold">Pedidos</p>
              <p className="text-[#777]">Ventas y actividad</p>
            </div>
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-4">
              <p className="text-white font-semibold">Usuarios</p>
              <p className="text-[#777]">Roles y permisos</p>
            </div>
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-4">
              <p className="text-white font-semibold">Metricas</p>
              <p className="text-[#777]">Resumen global</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleAdminLogin} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-4">Inicio de sesion especial</p>
          <h2 className="text-3xl font-bold text-white mb-8">Panel interno</h2>

          <label className="block text-sm font-semibold text-[#888] mb-2" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-4 text-white outline-none transition focus:border-[#00FF66]"
            autoComplete="username"
            required
          />

          <label className="block text-sm font-semibold text-[#888] mt-5 mb-2" htmlFor="admin-password">
            Contrasena
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-4 text-white outline-none transition focus:border-[#00FF66]"
            autoComplete="current-password"
            required
          />

          {message && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#00FF66] px-6 py-4 font-bold text-[#050505] transition hover:bg-[#00CC52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar al panel"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#111111] to-[#171717] p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#00FF66] mb-4">{isAdmin ? "Administracion" : "Edicion"}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">{isAdmin ? "Panel CoderUp" : "Panel de cursos"}</h1>
            <p className="text-[#888] max-w-3xl">
              {isAdmin
                ? "Gestiona la plataforma desde un unico panel: resumen, cursos, usuarios y pedidos sin salir de esta pagina."
                : "Gestiona cursos desde la base de datos real: crear, editar, publicar u ocultar y eliminar contenido del catalogo."}
            </p>
          </div>

          <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-4 min-w-64">
            <p className="text-sm text-[#888]">Sesion activa</p>
            <p className="text-white font-semibold mt-1">{user.name}</p>
            <p className="text-xs text-[#777] break-all">{user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm font-semibold text-white transition hover:border-red-400/60 hover:text-red-200"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </section>

      <nav className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {visibleTabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-[#00FF66] bg-[#00FF66]/10 text-white"
                  : "border-[#2A2A2A] bg-[#1A1A1A] text-[#888] hover:border-[#00FF66]/50 hover:text-white"
              }`}
            >
              <span className="block font-bold">{tab.label}</span>
              <span className="mt-1 block text-sm text-[#777]">{tab.description}</span>
            </button>
          );
        })}
      </nav>

      <section className="space-y-6">
        {isAdmin && activeTab === "resumen" && <AdminStats />}
        {activeTab === "cursos" && <AdminCoursesManager />}
        {isAdmin && activeTab === "usuarios" && <AdminUsersManager />}
        {isAdmin && activeTab === "pedidos" && <AdminOrdersManager />}
        {isAdmin && activeTab === "cupones" && <CouponsPanel />}
      </section>
    </div>
  );
}
