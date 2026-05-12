import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getCurrentUser,
  initAuth,
  loginUser,
  logoutUser,
  registerUser,
  subscribeAuth,
  syncCurrentUserFromBackend,
} from "../../lib/auth";
import { apiFetch } from "../../lib/api";

export function useAuth() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Cargar sesión local (inmediato, sin parpadeo)
    initAuth();

    // 2. Verificar con el backend si hay sesión PHP activa
    // Si hay sesión en el servidor pero no en local (p.ej. otra pestaña),
    // sincronizamos. Si no hay backend, simplemente usamos la local.
    apiFetch<any>("/auth/me.php").then((result) => {
      if (result.ok && result.data) {
        syncCurrentUserFromBackend(result.data);
      }
      setInitialized(true);
    });
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
