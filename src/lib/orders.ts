import { clearAppliedCoupon, clearCartStore, getAppliedCoupon, getCartDiscount, getCartItems, getCartSubtotal, getCartTotal } from "./cart";
import { updateCurrentUser } from "./auth";
import { initEnrollments, seedEnrollments } from "./enrollments";
import { loadFromStorage, saveToStorage } from "./storage";
import type { Course, Order, OrderItem, User } from "./types";

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

export async function createSimulatedOrder(user: User, courses: Course[]) {
  initOrders();
  initEnrollments();
  const cart = getCartItems();

  if (!cart.length) {
    return { ok: false as const, message: "El carrito está vacío." };
  }

  await new Promise((resolve) => setTimeout(resolve, 1400));

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

  const nextOrder: Order = {
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

  orders = [...orders, nextOrder];
  persist();
  notify();

  const purchasedCourses = courses.filter((course) => cart.some((item) => item.slug === course.slug));
  seedEnrollments(user.id, purchasedCourses);

  if (couponCode === "WELCOME20") {
    updateCurrentUser({ isNewUser: false, usedWelcomeCoupon: true });
  } else {
    updateCurrentUser({ isNewUser: false });
  }

  clearAppliedCoupon();
  clearCartStore();

  return { ok: true as const, order: nextOrder };
}
