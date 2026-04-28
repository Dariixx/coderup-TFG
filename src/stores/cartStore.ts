import {
  addCourseToCart,
  applyWelcomeCoupon,
  clearAppliedCoupon,
  clearCartStore,
  getAppliedCoupon,
  getCartCount as getCartCountFromStore,
  getCartDiscount as getCartDiscountFromStore,
  getCartItems,
  getCartSubtotal as getCartSubtotalFromStore,
  getCartTotal as getCartTotalFromStore,
  initCartStore,
  isCourseInCart,
  removeCourseFromCart,
  subscribeCart,
} from "../lib/cart";
import type { CartItem } from "../lib/types";

export type { CartItem };

export function initCart() {
  initCartStore();
}

export function getCart(): CartItem[] {
  return getCartItems();
}

export function addToCart(item: CartItem) {
  return addCourseToCart(item);
}

export function removeFromCart(slug: string) {
  removeCourseFromCart(slug);
}

export function clearCart() {
  clearCartStore();
}

export function isInCart(slug: string): boolean {
  return isCourseInCart(slug);
}

export function getCartTotal(): number {
  return getCartTotalFromStore();
}

export function getCartSubtotalValue(): number {
  return getCartSubtotalFromStore();
}

export function getCartDiscountValue(): number {
  return getCartDiscountFromStore();
}

export function getActiveCoupon() {
  return getAppliedCoupon();
}

export function resetCoupon() {
  clearAppliedCoupon();
}

export function applyCoupon(code: string) {
  return applyWelcomeCoupon(code);
}

export function getCartCountValue(): number {
  return getCartCountFromStore();
}

export function getCartCount(): number {
  return getCartCountFromStore();
}

export function subscribe(listener: () => void) {
  return subscribeCart(listener);
}
