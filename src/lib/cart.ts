import { getCurrentUser } from "./auth";
import { addToCart as apiAddToCart, getCart as apiGetCart, removeFromCart as apiRemoveFromCart, validateCoupon } from "./api";
import type { AppliedCoupon, CartItem, Coupon } from "./types";
import { COUPON_REGEX } from "./utils";

export const WELCOME_COUPON: Coupon = {
  code: "WELCOME20",
  discountType: "percentage",
  discountValue: 20,
  onlyNewUsers: true,
  maxUses: 1,
  active: true,
};

type CartListener = () => void;

let cart: CartItem[] = [];
let subtotal = 0;
let total = 0;
let appliedCoupon: AppliedCoupon | null = null;
let listeners: CartListener[] = [];
let initialized = false;
let loadingPromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function mapApiCartItem(item: any): CartItem {
  return {
    id: Number(item.id),
    courseId: String(item.course_id),
    slug: item.slug,
    title: item.title,
    price: Number(item.price) || 0,
    thumbnailUrl: item.thumbnail_url ?? undefined,
    instructorName: item.instructor_name ?? undefined,
    isFree: Number(item.price) <= 0,
    accessType: Number(item.price) <= 0 ? "free" : "premium",
    icon: "lucide:code-2",
    iconColor: "text-[#00FF66]",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-600/20",
    category: item.category_name ?? "Curso",
  };
}

function hydrateFromApi(payload: any) {
  const items = payload?.items ?? [];
  cart = Array.isArray(items) ? items.map(mapApiCartItem) : [];
  subtotal = Number(payload?.subtotal) || cart.reduce((sum, item) => sum + item.price, 0);
  const apiDiscount = Number(payload?.discount) || 0;
  total = Number(payload?.total) || Math.max(0, subtotal - apiDiscount);

  if (payload?.coupon_code && apiDiscount > 0) {
    appliedCoupon = {
      code: payload.coupon_code,
      discountAmount: apiDiscount,
    };
  } else if (appliedCoupon) {
    appliedCoupon = {
      ...appliedCoupon,
      discountAmount: Number((subtotal - total).toFixed(2)),
    };
  }
}

export async function initCartStore() {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = refreshCartStore().finally(() => {
    initialized = true;
    loadingPromise = null;
    notify();
  });

  return loadingPromise;
}

export function isCartInitialized() {
  return initialized;
}

export async function refreshCartStore() {
  const response = await apiGetCart();
  if (response.ok) {
    hydrateFromApi(response.data);
    notify();
  }
}

export function subscribeCart(listener: CartListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function getCartItems() {
  return cart;
}

export function getCartCount() {
  return cart.length;
}

export function getCartSubtotal() {
  return subtotal;
}

export function getAppliedCoupon() {
  return appliedCoupon;
}

export function getCartDiscount() {
  return appliedCoupon?.discountAmount ?? Math.max(0, subtotal - total);
}

export function getCartTotal() {
  return Math.max(0, total || subtotal - getCartDiscount());
}

export function isCourseInCart(slug: string) {
  return cart.some((item) => item.slug === slug);
}

export async function addCourseToCart(item: CartItem) {
  if (item.isFree || cart.some((course) => course.slug === item.slug)) {
    return false;
  }

  const response = await apiAddToCart(item.courseId);
  if (!response.ok) {
    return false;
  }

  hydrateFromApi(response.data);
  notify();
  return true;
}

export async function removeCourseFromCart(slugOrId: string | number) {
  const item =
    typeof slugOrId === "number"
      ? cart.find((cartItem) => cartItem.id === slugOrId)
      : cart.find((cartItem) => cartItem.slug === slugOrId || String(cartItem.id) === slugOrId);

  if (!item?.id) {
    return;
  }

  const response = await apiRemoveFromCart(item.id);
  if (response.ok) {
    hydrateFromApi(response.data);
    notify();
  }
}

export async function clearCartStore() {
  await Promise.all(cart.map((item) => (item.id ? apiRemoveFromCart(item.id) : Promise.resolve())));
  cart = [];
  subtotal = 0;
  total = 0;
  appliedCoupon = null;
  notify();
}

export function clearAppliedCoupon() {
  appliedCoupon = null;
  notify();
}

export async function applyWelcomeCoupon(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  const user = getCurrentUser();

  if (!user) {
    return { ok: false as const, message: "Debes iniciar sesión para usar cupones." };
  }

  if (!cart.length) {
    return { ok: false as const, message: "Añade al menos un curso premium al carrito." };
  }

  if (!COUPON_REGEX.test(normalizedCode)) {
    return { ok: false as const, message: "El formato del cupón no es válido." };
  }

  const response = await validateCoupon(normalizedCode, cart.length);
  const coupon = response.data as {
    valid?: boolean;
    discount_type?: string;
    discount_value?: number;
    message?: string;
    code?: string;
  };

  if (!response.ok || !coupon.valid) {
    return { ok: false as const, message: coupon.message ?? "El cupón no es válido." };
  }

  const discountValue = Number(coupon.discount_value ?? 0);
  const discountAmount =
    coupon.discount_type === "fixed"
      ? Math.min(getCartSubtotal(), discountValue)
      : Number((getCartSubtotal() * (discountValue / 100)).toFixed(2));

  appliedCoupon = {
    code: coupon.code ?? normalizedCode,
    discountAmount,
  };
  total = Math.max(0, subtotal - discountAmount);
  notify();

  return { ok: true as const, message: coupon.message ?? "Cupón aplicado correctamente." };
}
