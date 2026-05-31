import { useEffect, useState } from "react";
import { getAvailableCoupons } from "../../lib/api";
import { useAuth } from "./useAuth";

interface CouponRecord {
  code: string;
  description: string;
  discount_type: string;
  discount_value: number | string;
  min_items: number | string;
  max_uses: number | string;
  uses: number | string;
  only_new_users: number | boolean;
  expires_at?: string | null;
}

function couponValue(coupon: CouponRecord) {
  const value = Number(coupon.discount_value);
  return coupon.discount_type === "fixed" ? `${value.toFixed(2)} €` : `${value.toFixed(0)}%`;
}

export default function CouponsPanel() {
  const { user, initialized } = useAuth();
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [message, setMessage] = useState("Cargando cupones...");

  useEffect(() => {
    if (!initialized || !user) return;

    getAvailableCoupons()
      .then((response) => {
        setCoupons(response.data?.coupons ?? []);
        setMessage("");
      })
      .catch(() => setMessage("No se han podido cargar los cupones disponibles."));
  }, [initialized, user?.id, user?.role]);

  if (!initialized || !user) return null;

  return (
    <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[#00FF66]">Cupones</p>
          <h2 className="text-2xl font-bold text-white">Disponibles para tu rol</h2>
        </div>
        <p className="text-sm text-[#888]">{user.role === "admin" ? "Admin ve todos" : `Rol: ${user.role}`}</p>
      </div>

      {message ? (
        <p className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 text-sm text-[#888]">{message}</p>
      ) : coupons.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111] p-4 text-sm text-[#888]">No hay cupones activos para este rol.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <article key={coupon.code} className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4 transition hover:-translate-y-0.5 hover:border-[#00FF66]/45">
              <div className="mb-3 flex items-center justify-between gap-3">
                <code className="rounded-lg bg-[#00FF66]/10 px-3 py-1 text-sm font-bold text-[#00FF66]">{coupon.code}</code>
                <span className="text-lg font-black text-white">{couponValue(coupon)}</span>
              </div>
              <p className="text-sm leading-6 text-[#B0B0B0]">{coupon.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#888]">
                <span className="rounded-full border border-[#2A2A2A] px-2 py-1">Desde {coupon.min_items} curso(s)</span>
                {Boolean(Number(coupon.only_new_users)) && <span className="rounded-full border border-[#2A2A2A] px-2 py-1">Primera compra</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
