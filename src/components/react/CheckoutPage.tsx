import { useState } from "react";
import { createOrder } from "../../lib/orders";
import { formatPrice } from "../../lib/utils";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

export default function CheckoutPage() {
  const { user, initialized } = useAuth();
  const { cart, subtotal, discount, total } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!initialized) {
    return <div className="h-48 rounded-2xl border border-[#2A2A2A] bg-[#111111] animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Inicia sesión para completar el checkout</h2>
        <a href="/login" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Ir al login
        </a>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">No hay cursos premium en el carrito</h2>
        <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-semibold text-[#0A0A0A] hover:bg-[#00CC52] transition">
          Volver al catálogo
        </a>
      </div>
    );
  }

  const handleCheckout = async () => {
    setStatus("loading");
    setMessage("");
    const result = await createOrder();

    if (!result.ok) {
      setStatus("error");
      setMessage(result.message);
      return;
    }

    setStatus("success");
    setMessage(`Pedido ${result.order.orderNumber} generado correctamente.`);
    window.setTimeout(() => {
      window.location.href = "/mi-cuenta/mis-cursos";
    }, 1200);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 rounded-[28px] border border-[#2A2A2A] bg-[radial-gradient(circle_at_top_left,_rgba(0,255,102,0.08),_transparent_30%),linear-gradient(180deg,#191919_0%,#121212_100%)] p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Confirmación del pedido</h2>
        <p className="text-[#888] mb-8">El pedido se registra en el backend PHP y se guarda en MySQL mediante un endpoint JSON.</p>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm text-[#888] mb-2">Nombre</label>
            <input value={user.name} readOnly className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-[#888] mb-2">Email</label>
            <input value={user.email} readOnly className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6 mb-6">
          <p className="text-sm text-[#888] mb-2">Método de pago</p>
          <p className="text-white font-semibold">Pago de demostración para entorno académico</p>
          <p className="text-sm text-[#666] mt-2">No se almacenan datos sensibles. El objetivo es demostrar la lógica de pedidos y persistencia.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#666] mb-2">Backend</p>
            <p className="text-white font-semibold">PHP + JSON</p>
          </div>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#666] mb-2">Persistencia</p>
            <p className="text-white font-semibold">MySQL + PDO</p>
          </div>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#666] mb-2">Sesión</p>
            <p className="text-white font-semibold">Usuario autenticado</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={status === "loading"}
          className="w-full rounded-xl bg-[#00FF66] px-5 py-4 font-bold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? "Procesando pedido..." : "Finalizar compra"}
        </button>

        {message && (
          <p
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-[#00FF66]/30 bg-[#00FF66]/10 text-[#9CFFBF]"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <aside className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 h-fit">
        <h3 className="text-xl font-bold text-white mb-5">Resumen</h3>
        <div className="space-y-3 mb-6">
          {cart.map((item) => (
            <div key={item.slug} className="flex items-center justify-between text-sm gap-3">
              <span className="text-[#888]">{item.title}</span>
              <span className="text-white">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#2A2A2A] pt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#888]">Subtotal</span>
            <span className="text-white">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">Descuento</span>
            <span className="text-white">-{formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-white">Total</span>
            <span className="text-[#00FF66]">{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
