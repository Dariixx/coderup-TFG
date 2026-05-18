import { useState, useEffect, useSyncExternalStore } from "react";
import {
  applyCoupon,
  getActiveCoupon,
  initCart,
  getCart,
  getCartCount,
  getCartDiscountValue,
  getCartSubtotalValue,
  getCartTotal,
  addToCart,
  removeFromCart,
  clearCart,
  isInCart,
  isInitialized,
  subscribe,
  type CartItem,
} from "../../stores/cartStore";

export function useCart() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized()) {
      setInitialized(true);
      return;
    }

    initCart().finally(() => setInitialized(true));
  }, []);

  const cart = useSyncExternalStore(
    subscribe,
    () => getCart(),
    () => [] as CartItem[]
  );

  const count = useSyncExternalStore(
    subscribe,
    () => getCartCount(),
    () => 0
  );

  const total = useSyncExternalStore(
    subscribe,
    () => getCartTotal(),
    () => 0
  );

  const subtotal = useSyncExternalStore(
    subscribe,
    () => getCartSubtotalValue(),
    () => 0
  );

  const discount = useSyncExternalStore(
    subscribe,
    () => getCartDiscountValue(),
    () => 0
  );

  const coupon = useSyncExternalStore(
    subscribe,
    () => getActiveCoupon(),
    () => null
  );

  return {
    cart,
    count,
    subtotal,
    discount,
    total,
    coupon,
    addToCart,
    applyCoupon,
    removeFromCart,
    clearCart,
    isInCart,
    initialized,
  };
}
