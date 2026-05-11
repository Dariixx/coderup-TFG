import { apiGet, apiPost } from "./api";
import { clearAppliedCoupon, clearCartStore, getAppliedCoupon, getCartDiscount, getCartItems, getCartSubtotal, getCartTotal } from "./cart";
import type { Order } from "./types";

type OrderListener = () => void;

interface ApiOrderItem {
  course_id: number;
  title: string;
  slug: string;
  price: number | string;
}

interface ApiOrder {
  id: number;
  user_id: number;
  total: number | string;
  discount_code?: string | null;
  discount_amount: number | string;
  status: string;
  created_at: string;
  items: ApiOrderItem[];
}

let orders: Order[] = [];
let listeners: OrderListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function mapApiOrder(order: ApiOrder): Order {
  const discount = Number(order.discount_amount ?? 0);
  const total = Number(order.total ?? 0);

  return {
    id: String(order.id),
    orderNumber: `ORD-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(3, "0")}`,
    userId: String(order.user_id),
    items: order.items.map((item) => ({
      courseId: String(item.course_id),
      title: item.title,
      priceAtPurchase: Number(item.price),
      slug: item.slug,
    })),
    subtotal: Number((total + discount).toFixed(2)),
    discount,
    total,
    status: "completed",
    couponCode: order.discount_code ?? undefined,
    createdAt: order.created_at,
  };
}

export async function initOrders() {
  try {
    const response = await apiGet<{ orders: ApiOrder[] }>("/orders/user-orders.php");
    orders = (response.data?.orders ?? []).map(mapApiOrder);
  } catch {
    orders = [];
  }

  notify();
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

export function clearOrders() {
  orders = [];
  notify();
}

export async function createOrder() {
  const cart = getCartItems();

  if (!cart.length) {
    return { ok: false as const, message: "El carrito está vacío." };
  }

  const subtotal = Number(getCartSubtotal().toFixed(2));
  const discount = Number(getCartDiscount().toFixed(2));
  const total = Number(getCartTotal().toFixed(2));
  const couponCode = getAppliedCoupon()?.code ?? undefined;

  try {
    const response = await apiPost<{ order: ApiOrder }>("/orders/create.php", {
      courses: cart.map((item) => Number(item.courseId)),
      discount_code: couponCode,
    });

    const createdOrder = response.data?.order;

    if (!createdOrder) {
      return { ok: false as const, message: "El backend no ha devuelto el pedido creado." };
    }

    const uiOrder: Order = {
      id: String(createdOrder.id),
      orderNumber: `ORD-${new Date().getFullYear()}-${String(createdOrder.id).padStart(3, "0")}`,
      userId: String(createdOrder.user_id),
      items: cart.map((item) => ({
        courseId: item.courseId,
        title: item.title,
        priceAtPurchase: item.price,
        slug: item.slug,
      })),
      subtotal,
      discount,
      total,
      status: "completed",
      couponCode,
      createdAt: createdOrder.created_at,
    };

    await initOrders();
    clearAppliedCoupon();
    clearCartStore();

    return { ok: true as const, order: uiOrder };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "No se ha podido crear el pedido." };
  }
}
