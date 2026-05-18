import { useState } from "react";
import { formatPrice } from "../../lib/utils";
import CartItem from "./CartItem";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: Props) {
  const { cart, count, subtotal, discount, total, removeFromCart, clearCart, applyCoupon, coupon } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState(coupon?.code ?? "");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleApplyCoupon = async () => {
    setLoading(true);
    const result = await applyCoupon(couponCode);
    setCouponStatus(result.ok ? "success" : "error");
    setCouponMessage(result.message);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Carrito">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar carrito" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2A2A2A] bg-[#111111] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2A2A2A] bg-[#111111] p-6">
          <h2 className="text-2xl font-bold text-white">Carrito ({count})</h2>
          <button type="button" onClick={onClose} className="text-[#888] hover:text-white transition text-2xl leading-none" aria-label="Cerrar">
            x
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {count === 0 ? (
            <div className="text-center py-14">
              <p className="text-[#888] mb-6">Tu carrito está vacío.</p>
              <a href="/cursos" className="inline-flex rounded-xl bg-[#00FF66] px-6 py-3 font-bold text-[#0A0A0A] hover:bg-[#00CC52] transition">
                Explorar cursos
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem key={item.slug} item={item} onRemove={removeFromCart} />
              ))}
            </div>
          )}
        </div>

        {count > 0 && (
          <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] p-6">
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="WELCOME20"
                className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#888] focus:border-[#00FF66]/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={loading}
                className="rounded-xl border border-[#2A2A2A] px-4 py-3 text-sm text-[#E0E0E0] transition hover:border-[#00FF66]/50 hover:text-white disabled:opacity-50"
              >
                {loading ? "Aplicando..." : "Aplicar"}
              </button>
            </div>

            {couponMessage && (
              <p className={`mb-4 rounded-xl px-3 py-2 text-sm ${couponStatus === "success" ? "bg-[#00FF66]/10 text-[#9CFFBF]" : "bg-red-500/10 text-red-300"}`}>
                {couponMessage}
              </p>
            )}

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Descuento</span>
                  <span className="text-[#00FF66]">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Total</span>
                <span className="text-[#00FF66] font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={user ? "/checkout" : "/login"} className="flex-1 rounded-xl bg-[#00FF66] px-6 py-3 text-center font-bold text-[#0A0A0A] hover:bg-[#00CC52] transition">
                {user ? "Finalizar compra" : "Iniciar sesión para comprar"}
              </a>
              <button type="button" onClick={clearCart} className="rounded-xl border border-[#2A2A2A] px-6 py-3 text-sm text-[#888] hover:text-red-300 transition">
                Vaciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
