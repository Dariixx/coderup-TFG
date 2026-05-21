import { useEffect, useState } from "react";
import { apiGet, getApiHelpMessage } from "../../../lib/api";

interface StatsPayload {
  stats?: {
    users: number;
    courses: number;
    orders: number;
    total_revenue: number;
    latest_orders: Array<{
      id: number;
      total: number;
      status: string;
      created_at: string;
      user_name: string;
      user_email: string;
    }>;
  };
  totalUsers?: number;
  totalCourses?: number;
  totalOrders?: number;
  totalRevenue?: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsPayload["stats"] | null>(null);
  const [message, setMessage] = useState("Cargando estadísticas...");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

  useEffect(() => {
    apiGet<StatsPayload>("/admin/stats.php")
      .then((response) => {
        const data = response.data;
        const nextStats = data?.stats ?? {
          users: Number(data?.totalUsers ?? 0),
          courses: Number(data?.totalCourses ?? 0),
          orders: Number(data?.totalOrders ?? 0),
          total_revenue: Number(data?.totalRevenue ?? 0),
          latest_orders: [],
        };

        setStats({
          users: Number(nextStats.users ?? 0),
          courses: Number(nextStats.courses ?? 0),
          orders: Number(nextStats.orders ?? 0),
          total_revenue: Number(nextStats.total_revenue ?? 0),
          latest_orders: Array.isArray(nextStats.latest_orders) ? nextStats.latest_orders : [],
        });
        setStatus("success");
        setMessage("");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(`${getApiHelpMessage(error)} No se han podido cargar las métricas del panel.`);
      });
  }, []);

  if (status !== "success" || !stats) {
    return (
      <div className={`rounded-2xl border p-6 ${status === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-[#2A2A2A] bg-[#1A1A1A] text-[#888]"}`} role={status === "error" ? "alert" : "status"}>
        {message || "No se han recibido estadísticas. Actualiza la página o revisa la API de administración."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-sm text-[#888] mb-2">Usuarios</p>
          <p className="text-3xl font-bold text-white">{stats.users}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-sm text-[#888] mb-2">Cursos</p>
          <p className="text-3xl font-bold text-white">{stats.courses}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-sm text-[#888] mb-2">Pedidos</p>
          <p className="text-3xl font-bold text-white">{stats.orders}</p>
        </div>
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <p className="text-sm text-[#888] mb-2">Ingresos</p>
          <p className="text-3xl font-bold text-white">{stats.total_revenue.toFixed(2)} €</p>
        </div>
      </div>

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Últimos pedidos</h2>
        {(stats.latest_orders ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111] p-5 text-[#888]">
            Todavia no hay pedidos registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {(stats.latest_orders ?? []).map((order) => (
              <div key={order.id} className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">{order.user_name}</p>
                  <p className="text-sm text-[#888]">{order.user_email}</p>
                </div>
                <div className="text-sm">
                  <p className="text-white">{order.total.toFixed(2)} €</p>
                  <p className="text-[#888] capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
