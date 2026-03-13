import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const safeDelay = Number.isFinite(delay) ? Math.max(0, delay) : 0;
    const timer = setTimeout(() => {
      setDebounced(value);
    }, safeDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}
