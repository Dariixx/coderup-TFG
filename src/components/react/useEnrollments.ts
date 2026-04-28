import { useEffect, useState, useSyncExternalStore } from "react";
import { getEnrollments, initEnrollments, subscribeEnrollments, updateEnrollmentProgress } from "../../lib/enrollments";

export function useEnrollments() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initEnrollments();
    setInitialized(true);
  }, []);

  const enrollments = useSyncExternalStore(subscribeEnrollments, () => getEnrollments(), () => []);

  return {
    enrollments,
    initialized,
    updateEnrollmentProgress,
  };
}
