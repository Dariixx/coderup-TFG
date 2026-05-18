import { useEffect, useState, useSyncExternalStore } from "react";
import { areEnrollmentsInitialized, getEnrollments, initEnrollments, subscribeEnrollments, updateEnrollmentProgress } from "../../lib/enrollments";

export function useEnrollments() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (areEnrollmentsInitialized()) {
      setInitialized(true);
      return;
    }

    initEnrollments().finally(() => setInitialized(true));
  }, []);

  const enrollments = useSyncExternalStore(subscribeEnrollments, () => getEnrollments(), () => []);

  return {
    enrollments,
    initialized,
    updateEnrollmentProgress,
  };
}
