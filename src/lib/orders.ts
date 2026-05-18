import {
  clearAppliedCoupon,
  getAppliedCoupon,
  getCartDiscount,
  getCartItems,
  getCartSubtotal,
  getCartTotal,
  refreshCartStore,
} from "./cart";
import { updateCurrentUser } from "./auth";
import type { Course, Order, OrderItem, User } from "./types";
import { apiFetch, checkout } from "./api";

type OrderListener = () => void;

let orders: Order[] = [];
let listeners: OrderListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
}

export function initOrders() {
  orders = [];
}

export function subscribeOrders(listener: OrderListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function getOrders() {
  return orders;
}

export function getUserOrders(userId: string) {
  return orders.filter((order) => order.userId === userId);
}

function getNextOrderNumber() {
  return `ORD-2026-${String(orders.length + 1).padStart(3, "0")}`;
}

/* ─── CREATE ORDER ──────────────────────────────────────────────────────── */

export async function createSimulatedOrder(user: User, courses: Course[]) {
  initOrders();
  const cart = getCartItems();

  if (!cart.length) {
    return { ok: false as const, message: "El carrito está vacío." };
  }

  const items: OrderItem[] = cart.map((item) => ({
    courseId: item.courseId,
    title: item.title,
    priceAtPurchase: item.price,
    slug: item.slug,
  }));

  const subtotal = Number(getCartSubtotal().toFixed(2));
  const discount = Number(getCartDiscount().toFixed(2));
  const total = Number(getCartTotal().toFixed(2));
  const couponCode = getAppliedCoupon()?.code;

  const result = await checkout(couponCode);

  if (!result.ok) {
    return { ok: false as const, message: result.message };
  }

  const newOrder: Order = {
    id: String(result.data.id ?? result.data.order_id ?? crypto.randomUUID()),
    orderNumber: result.data.order_number ?? getNextOrderNumber(),
    userId: user.id,
    items,
    subtotal,
    discount: Number(result.data.discount_amount ?? discount),
    total: Number(result.data.total ?? total),
    status: "completed",
    couponCode: result.data.coupon_code ?? couponCode,
    createdAt: result.data.created_at ?? new Date().toISOString(),
  };

  orders = [...orders, newOrder];
  persist();
  notify();

  void courses;

  if (couponCode === "WELCOME20") {
    updateCurrentUser({ isNewUser: false, usedWelcomeCoupon: true });
  } else {
    updateCurrentUser({ isNewUser: false });
  }

  clearAppliedCoupon();
  await refreshCartStore();

  return { ok: true as const, order: newOrder };
}

/* ─── FETCH USER ORDERS FROM BACKEND ───────────────────────────────────── */

export async function fetchUserOrdersFromBackend(): Promise<Order[] | null> {
  const result = await apiFetch<any>("/api/orders.php");
  if (!result.ok) return null;

  const orders = Array.isArray(result.data) ? result.data : result.data.orders ?? [];

  return orders.map((o: any) => ({
    id: String(o.id),
    orderNumber: o.order_number ?? `ORD-${o.id}`,
    userId: String(o.user_id),
    items: o.items ?? [],
    subtotal: Number(o.subtotal),
    discount: Number(o.discount_amount ?? o.discount ?? 0),
    total: Number(o.total),
    status: "completed" as const,
    couponCode: o.coupon_code ?? undefined,
    createdAt: o.created_at,
  }));
}
