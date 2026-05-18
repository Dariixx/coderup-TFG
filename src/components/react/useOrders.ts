import { useEffect, useState, useSyncExternalStore } from "react";
import { areOrdersInitialized, getOrders, initOrders, subscribeOrders } from "../../lib/orders";

export function useOrders() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (areOrdersInitialized()) {
      setInitialized(true);
      return;
    }

    initOrders().finally(() => setInitialized(true));
  }, []);

  const orders = useSyncExternalStore(subscribeOrders, () => getOrders(), () => []);

  return {
    orders,
    initialized,
  };
}
