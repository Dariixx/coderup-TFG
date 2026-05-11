import { useEffect, useState } from "react";
import { apiGet, getApiHelpMessage } from "../../../lib/api";

interface StatsPayload {
  stats: {
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
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsPayload["stats"] | null>(null);
  const [message, setMessage] = useState("Cargando estadísticas...");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");

  useEffect(() => {
    apiGet<StatsPayload>("/admin/stats.php")
      .then((response) => {
        setStats(response.data?.stats ?? null);
        setStatus("success");
        setMessage("");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getApiHelpMessage(error));
      });
  }, []);

  if (status !== "success" || !stats) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">{message}</div>;
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
        {stats.latest_orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111] p-5 text-[#888]">
            Todavía no hay pedidos registrados. Importa `seed.sql` o crea un pedido desde el checkout para enseñar esta evidencia en la demo.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.latest_orders.map((order) => (
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
