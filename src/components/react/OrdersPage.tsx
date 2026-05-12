import { formatDate, formatPrice } from "../../lib/utils";
import { useAuth } from "./useAuth";
import { useOrders } from "./useOrders";

export default function OrdersPage() {
  const { user, initialized } = useAuth();
  const { orders } = useOrders();

  if (!initialized) {
    return <div className="h-48 rounded-2xl border border-[#2A2A2A] bg-[#111111] animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Accede para consultar tus pedidos</h2>
        <a href="/login" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Iniciar sesión
        </a>
      </div>
    );
  }

  const myOrders = orders.filter((order) => order.userId === user.id);

  if (!myOrders.length) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Todavía no hay pedidos</h2>
        <p className="text-[#888] mb-6">Tus compras premium aparecerán aquí una vez completes el checkout.</p>
        <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Ver cursos premium
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {myOrders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div>
              <p className="text-sm text-[#888]">Pedido</p>
              <h2 className="text-2xl font-bold text-white">{order.orderNumber}</h2>
              <p className="text-sm text-[#888] mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <span className="rounded-full bg-[#00FF66]/10 px-4 py-2 text-sm text-[#00FF66] self-start">Completado</span>
          </div>
          <div className="space-y-3 mb-6">
            {order.items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between text-sm">
                <a href={`/cursos/${item.slug}`} className="text-white hover:text-[#00FF66] transition">
                  {item.title}
                </a>
                <span className="text-[#888]">{formatPrice(item.priceAtPurchase)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2A2A2A] pt-4 grid sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[#888]">Subtotal</p>
              <p className="text-white font-semibold">{formatPrice(order.subtotal)}</p>
            </div>
            <div>
              <p className="text-[#888]">Descuento</p>
              <p className="text-white font-semibold">-{formatPrice(order.discount)}</p>
            </div>
            <div>
              <p className="text-[#888]">Cupón</p>
              <p className="text-white font-semibold">{order.couponCode ?? "Sin cupón"}</p>
            </div>
            <div>
              <p className="text-[#888]">Total</p>
              <p className="text-[#00FF66] font-semibold">{formatPrice(order.total)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
