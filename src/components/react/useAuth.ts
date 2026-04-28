import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getCurrentUser,
  initAuth,
  loginUser,
  logoutUser,
  registerUser,
  subscribeAuth,
} from "../../lib/auth";

export function useAuth() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initAuth();
    setInitialized(true);
  }, []);

  const user = useSyncExternalStore(subscribeAuth, () => getCurrentUser(), () => null);

  return {
    user,
    initialized,
    loginUser,
    registerUser,
    logoutUser,
  };
}
