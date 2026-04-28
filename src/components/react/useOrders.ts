import { useEffect, useState, useSyncExternalStore } from "react";
import { getOrders, initOrders, subscribeOrders } from "../../lib/orders";

export function useOrders() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initOrders();
    setInitialized(true);
  }, []);

  const orders = useSyncExternalStore(subscribeOrders, () => getOrders(), () => []);

  return {
    orders,
    initialized,
  };
}
