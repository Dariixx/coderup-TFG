import { getCurrentUser } from "./auth";
import type { AppliedCoupon, CartItem, Coupon } from "./types";
import { COUPON_REGEX } from "./utils";
import { validateCoupon } from "./api";

const CART_KEY = "coderup-cart";
const COUPON_KEY = "coderup-cart-coupon";

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
let appliedCoupon: AppliedCoupon | null = null;
let listeners: CartListener[] = [];
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));

  if (appliedCoupon) {
    window.localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
  } else {
    window.localStorage.removeItem(COUPON_KEY);
  }
}

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(CART_KEY);
    const parsed = storedCart ? JSON.parse(storedCart) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    window.localStorage.removeItem(CART_KEY);
    return [];
  }
}

function readStoredCoupon() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedCoupon = window.localStorage.getItem(COUPON_KEY);
    return storedCoupon ? (JSON.parse(storedCoupon) as AppliedCoupon) : null;
  } catch {
    window.localStorage.removeItem(COUPON_KEY);
    return null;
  }
}

export function initCartStore() {
  cart = readStoredCart();
  appliedCoupon = readStoredCoupon();
  initialized = true;
  notify();
}

export function isCartInitialized() {
  return initialized;
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

  if (normalizedCode === WELCOME_COUPON.code) {
    if (WELCOME_COUPON.onlyNewUsers && !user.isNewUser) {
      return { ok: false as const, message: "El cupón WELCOME20 solo está disponible para nuevos usuarios." };
    }

    if (user.usedWelcomeCoupon) {
      return { ok: false as const, message: "Ya has usado el cupón de bienvenida." };
    }
  }

  const response = await validateCoupon(normalizedCode, cart.length);
  const coupon = response.data as {
    valid?: boolean;
    discount_type?: string;
    discount_value?: number;
    message?: string;
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
    code: normalizedCode,
    discountAmount,
  };
  persist();
  notify();

  return { ok: true as const, message: "Cupón aplicado correctamente." };
}
