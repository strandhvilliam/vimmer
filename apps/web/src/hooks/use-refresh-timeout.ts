import { useState, useEffect } from "react";

export function useRefreshTimeout() {
  const [refreshTimeout, setRefreshTimeout] = useState(0);

  useEffect(() => {
    if (refreshTimeout === 0) return;
    const timer = setInterval(() => {
      setRefreshTimeout((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshTimeout]);

  const startTimeout = (seconds: number) => {
    setRefreshTimeout(seconds);
  };

  return {
    refreshTimeout,
    startTimeout,
    isActive: refreshTimeout > 0,
  };
}
