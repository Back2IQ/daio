import { useAnimatedCounter } from "../../hooks/use-animated-counter";
import { cn } from "@/lib/utils";

interface AnimatedValueProps {
  value: number;
  isVisible: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedValue({
  value,
  isVisible,
  prefix = "",
  suffix = "",
  duration = 2000,
  decimals = 0,
  className,
}: AnimatedValueProps) {
  const animated = useAnimatedCounter({ end: value, duration, decimals, enabled: isVisible });

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{animated}{suffix}
    </span>
  );
}
