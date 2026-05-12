/**
 * orders.ts — Gestión de pedidos con backend PHP real + fallback localStorage.
 */

import {
  clearAppliedCoupon,
  clearCartStore,
  getAppliedCoupon,
  getCartDiscount,
  getCartItems,
  getCartSubtotal,
  getCartTotal,
} from "./cart";
import { updateCurrentUser } from "./auth";
import { initEnrollments, seedEnrollments } from "./enrollments";
import { loadFromStorage, saveToStorage } from "./storage";
import type { Course, Order, OrderItem, User } from "./types";
import { apiFetch } from "./api";

const ORDERS_KEY = "coderup-orders";

type OrderListener = () => void;

let orders: Order[] = [];
let listeners: OrderListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  saveToStorage(ORDERS_KEY, orders);
}

export function initOrders() {
  orders = loadFromStorage<Order[]>(ORDERS_KEY, []);
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
  initEnrollments();
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

  // ── Intento backend real ──
  const result = await apiFetch<any>("/orders/create.php", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((i) => ({ course_id: i.courseId, price: i.priceAtPurchase })),
      subtotal,
      discount,
      total,
      coupon_code: couponCode ?? null,
    }),
  });

  let newOrder: Order;

  if (result.ok) {
    newOrder = {
      id: String(result.data.id ?? crypto.randomUUID()),
      orderNumber: result.data.order_number ?? getNextOrderNumber(),
      userId: user.id,
      items,
      subtotal,
      discount,
      total,
      status: "completed",
      couponCode,
      createdAt: result.data.created_at ?? new Date().toISOString(),
    };
  } else {
    // ── Fallback localStorage ──
    await new Promise((resolve) => setTimeout(resolve, 1400));
    newOrder = {
      id: crypto.randomUUID(),
      orderNumber: getNextOrderNumber(),
      userId: user.id,
      items,
      subtotal,
      discount,
      total,
      status: "completed",
      couponCode,
      createdAt: new Date().toISOString(),
    };
  }

  orders = [...orders, newOrder];
  persist();
  notify();

  const purchasedCourses = courses.filter((c) => cart.some((i) => i.slug === c.slug));
  seedEnrollments(user.id, purchasedCourses);

  if (couponCode === "WELCOME20") {
    updateCurrentUser({ isNewUser: false, usedWelcomeCoupon: true });
  } else {
    updateCurrentUser({ isNewUser: false });
  }

  clearAppliedCoupon();
  clearCartStore();

  return { ok: true as const, order: newOrder };
}

/* ─── FETCH USER ORDERS FROM BACKEND ───────────────────────────────────── */

export async function fetchUserOrdersFromBackend(): Promise<Order[] | null> {
  const result = await apiFetch<any[]>("/orders/user-orders.php");
  if (!result.ok) return null;

  return result.data.map((o: any) => ({
    id: String(o.id),
    orderNumber: o.order_number ?? `ORD-${o.id}`,
    userId: String(o.user_id),
    items: o.items ?? [],
    subtotal: Number(o.subtotal),
    discount: Number(o.discount ?? 0),
    total: Number(o.total),
    status: "completed" as const,
    couponCode: o.coupon_code ?? undefined,
    createdAt: o.created_at,
  }));
}
