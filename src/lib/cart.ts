import { getCurrentUser } from "./auth";
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage";
import type { AppliedCoupon, CartItem, Coupon } from "./types";
import { COUPON_REGEX } from "./utils";

const CART_KEY = "coderup-cart";
const COUPON_KEY = "coderup-cart-coupon";

export const WELCOME_COUPON: Coupon = {
  code: "WELCOME20",
  discountType: "percentage",
  discountValue: 20,
  onlyNewUsers: false,
  maxUses: 1,
  active: true,
};

type CartListener = () => void;

let cart: CartItem[] = [];
let appliedCoupon: AppliedCoupon | null = null;
let listeners: CartListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  saveToStorage(CART_KEY, cart);
  if (appliedCoupon) {
    saveToStorage(COUPON_KEY, appliedCoupon);
  } else {
    removeFromStorage(COUPON_KEY);
  }
}

export function initCartStore() {
  cart = loadFromStorage<CartItem[]>(CART_KEY, []);
  appliedCoupon = loadFromStorage<AppliedCoupon | null>(COUPON_KEY, null);
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
  return cart.reduce((sum, item) => sum + item.price, 0);
}

export function getAppliedCoupon() {
  return appliedCoupon;
}

export function getCartDiscount() {
  return appliedCoupon?.discountAmount ?? 0;
}

export function getCartTotal() {
  return Math.max(0, getCartSubtotal() - getCartDiscount());
}

export function isCourseInCart(slug: string) {
  return cart.some((item) => item.slug === slug);
}

export function addCourseToCart(item: CartItem) {
  if (item.isFree || cart.some((course) => course.slug === item.slug)) {
    return false;
  }

  cart = [...cart, item];

  if (appliedCoupon) {
    appliedCoupon = {
      ...appliedCoupon,
      discountAmount: Number((getCartSubtotal() * (WELCOME_COUPON.discountValue / 100)).toFixed(2)),
    };
  }

  persist();
  notify();
  return true;
}

export function removeCourseFromCart(slug: string) {
  cart = cart.filter((item) => item.slug !== slug);

  if (appliedCoupon) {
    appliedCoupon = cart.length
      ? {
          ...appliedCoupon,
          discountAmount: Number((getCartSubtotal() * (WELCOME_COUPON.discountValue / 100)).toFixed(2)),
        }
      : null;
  }

  persist();
  notify();
}

export function clearCartStore() {
  cart = [];
  appliedCoupon = null;
  persist();
  notify();
}

export function clearAppliedCoupon() {
  appliedCoupon = null;
  persist();
  notify();
}

export function applyWelcomeCoupon(code: string) {
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

  if (!WELCOME_COUPON.active || normalizedCode !== WELCOME_COUPON.code) {
    return { ok: false as const, message: "El cupón no es válido." };
  }

  const discountAmount = Number((getCartSubtotal() * (WELCOME_COUPON.discountValue / 100)).toFixed(2));
  appliedCoupon = {
    code: normalizedCode,
    discountAmount,
  };
  persist();
  notify();

  return { ok: true as const, message: "Cupón aplicado. La validación final se realizará al confirmar el pedido." };
}
