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
import { API_ENDPOINTS, apiFetch, checkout } from "./api";

type OrderListener = () => void;

let orders: Order[] = [];
let listeners: OrderListener[] = [];
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
}

function mapBackendOrder(record: any): Order {
  return {
    id: String(record.id),
    orderNumber: record.order_number,
    userId: String(record.user_id),
    items: (record.items ?? []).map((item: any) => ({
      courseId: String(item.course_id),
      title: item.course_title ?? item.title,
      priceAtPurchase: Number(item.price_at_purchase ?? item.price ?? 0),
      slug: item.course_slug ?? item.slug,
    })),
    subtotal: Number(record.subtotal) || 0,
    discount: Number(record.discount_amount ?? record.discount ?? 0),
    total: Number(record.total) || 0,
    status: "completed",
    couponCode: record.coupon_code ?? undefined,
    createdAt: record.created_at,
  };
}

export async function initOrders() {
  const backendOrders = await fetchUserOrdersFromBackend();
  orders = backendOrders ?? [];
  initialized = true;
  notify();
}

export function areOrdersInitialized() {
  return initialized;
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
    return { ok: false as const, message: "El carrito está vacío. Añade al menos un curso premium antes de finalizar la compra." };
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
    return {
      ok: false as const,
      message:
        result.message ||
        "No se ha podido procesar el checkout. Revisa la sesión, el cupón aplicado y la conexión con la API.",
    };
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
  const result = await apiFetch<any>(API_ENDPOINTS.orders.list);
  if (!result.ok) return null;

  const orders = Array.isArray(result.data) ? result.data : result.data.orders ?? [];

  return orders.map(mapBackendOrder);
}
