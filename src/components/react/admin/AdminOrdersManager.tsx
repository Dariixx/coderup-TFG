import { useEffect, useState } from "react";
import { apiGet, getApiHelpMessage } from "../../../lib/api";
import { useAuth } from "../useAuth";

interface OrderRecord {
  id: number;
  user_name: string;
  user_email: string;
  total: number | string;
  discount_code?: string | null;
  discount_amount: number | string;
  status: string;
  created_at: string;
  items: Array<{
    id: number;
    title: string;
    slug: string;
    price: number | string;
  }>;
}

export default function AdminOrdersManager() {
  const { user, initialized } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [message, setMessage] = useState("Cargando pedidos...");

  useEffect(() => {
    apiGet<{ orders: OrderRecord[] }>("/orders/index.php")
      .then((response) => {
        setOrders(response.data?.orders ?? []);
        setMessage("");
      })
      .catch((error) => {
        setMessage(getApiHelpMessage(error));
      });
  }, []);

  if (!initialized) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">Cargando sesión...</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">Solo el rol `admin` puede consultar todos los pedidos.</div>;
  }

  if (message) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">{message}</div>;
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">
          Aún no hay pedidos globales. Usa `cliente@coderup.com` o crea una compra desde el checkout para generar datos reales.
        </div>
      ) : orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Pedido #{order.id}</h2>
              <p className="text-sm text-[#888]">{order.user_name} · {order.user_email}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{Number(order.total).toFixed(2)} €</p>
              <p className="text-sm text-[#888] capitalize">{order.status}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-white">{item.title}</span>
                <span className="text-[#888]">{Number(item.price).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#2A2A2A] pt-4 flex flex-wrap gap-6 text-sm">
            <span className="text-[#888]">Descuento: {Number(order.discount_amount).toFixed(2)} €</span>
            <span className="text-[#888]">Cupón: {order.discount_code ?? "Sin cupón"}</span>
            <span className="text-[#888]">Fecha: {new Date(order.created_at).toLocaleString("es-ES")}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
