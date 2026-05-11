import { useEffect, useState, useSyncExternalStore } from "react";
import { clearOrders, getOrders, initOrders, subscribeOrders } from "../../lib/orders";
import { useAuth } from "./useAuth";

export function useOrders() {
  const { user, initialized: authReady } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!user) {
      clearOrders();
      setInitialized(true);
      return;
    }

    initOrders().finally(() => setInitialized(true));
  }, [authReady, user]);

  const orders = useSyncExternalStore(subscribeOrders, () => getOrders(), () => []);

  return {
    orders,
    initialized,
  };
}
