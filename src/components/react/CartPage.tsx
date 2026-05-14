import { useState } from "react";
import { formatPrice } from "../../lib/utils";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

export default function CartPage() {
  const { cart, count, subtotal, discount, total, removeFromCart, clearCart, applyCoupon, coupon, initialized } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState(coupon?.code ?? "");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");

  if (!initialized) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[#00FF66] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Tu carrito está vacío</h2>
        <p className="text-[#888] mb-8">Añade cursos premium para completar tu compra.</p>
        <a
          href="/cursos"
          className="bg-[#00FF66] text-[#0A0A0A] px-8 py-3 rounded-xl font-bold hover:bg-[#00CC52] transition inline-flex items-center gap-2"
        >
          Explorar cursos
        </a>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    const result = await applyCoupon(couponCode);
    setCouponStatus(result.ok ? "success" : "error");
    setCouponMessage(result.message);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">
            {count} curso{count !== 1 ? "s" : ""} en tu carrito
          </h2>
          <button onClick={clearCart} className="text-[#888] text-sm hover:text-red-400 transition">
            Vaciar carrito
          </button>
        </div>

        {cart.map((item) => (
          <div
            key={item.slug}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-6 items-center"
          >
            <a href={`/cursos/${item.slug}`} className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} rounded-xl flex items-center justify-center shrink-0`}>
              <svg className={`w-10 h-10 ${item.iconColor} opacity-70`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </a>

            <div className="flex-1 min-w-0">
              <a href={`/cursos/${item.slug}`} className="text-white font-bold hover:text-[#00FF66] transition block truncate">
                {item.title}
              </a>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-[#00FF66]/10 text-[#00FF66] px-2 py-0.5 rounded-full">{item.category}</span>
                <span className="text-xs bg-[#2A2A2A] text-[#E0E0E0] px-2 py-0.5 rounded-full">Premium</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[#00FF66] font-bold text-lg">{formatPrice(item.price)}</span>
              <button onClick={() => removeFromCart(item.slug)} className="text-[#888] hover:text-red-400 transition p-1">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 sticky top-24">
          <h3 className="text-xl font-bold text-white mb-6">Resumen del pedido</h3>

          <div className="mb-5 rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 text-sm">
            <p className="text-[#888] mb-1">Sesión actual</p>
            <p className="text-white">{user ? user.email : "No has iniciado sesión"}</p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="WELCOME20"
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-[#888] focus:border-[#00FF66]/50 focus:outline-none"
              />
              <button onClick={handleApplyCoupon} className="px-4 py-3 border border-[#2A2A2A] rounded-xl text-[#888] text-sm hover:border-[#00FF66]/50 hover:text-white transition">
                Aplicar
              </button>
            </div>
            {couponMessage && (
              <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${couponStatus === "success" ? "bg-[#00FF66]/10 text-[#9CFFBF]" : "bg-red-500/10 text-red-300"}`}>
                {couponMessage}
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-[#2A2A2A] pt-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Subtotal</span>
              <span className="text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Descuento</span>
              <span className="text-white">-{formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total</span>
              <span className="text-[#00FF66] font-bold">{formatPrice(total)}</span>
            </div>
          </div>

          <a
            href={user ? "/checkout" : "/login"}
            className="w-full bg-[#00FF66] text-[#0A0A0A] py-4 rounded-xl font-bold text-lg hover:bg-[#00CC52] transition shadow-lg shadow-[#00FF66]/20 flex items-center gap-2 justify-center"
          >
            {user ? "Ir al checkout" : "Iniciar sesión para comprar"}
          </a>
        </div>
      </aside>
    </div>
  );
}
