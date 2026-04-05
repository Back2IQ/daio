import { useEffect, useState, useRef } from "react";

interface UseAnimatedCounterOptions {
  end: number;
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useAnimatedCounter({
  end,
  duration = 2000,
  decimals = 0,
  enabled = false,
}: UseAnimatedCounterOptions): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = end * eased;
      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, end, duration, decimals]);

  return value;
}
