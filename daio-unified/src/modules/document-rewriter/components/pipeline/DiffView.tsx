import { computeDiff, diffStats } from "../../utils/diff-utils";
import { Badge } from "@/components/ui/badge";

interface DiffViewProps {
  original: string;
  rewritten: string;
}

export function DiffView({ original, rewritten }: DiffViewProps) {
  const segments = computeDiff(original, rewritten);
  const stats = diffStats(segments);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Badge variant="outline" className="text-green-600 border-green-300">
          +{stats.additions} added
        </Badge>
        <Badge variant="outline" className="text-red-600 border-red-300">
          -{stats.removals} removed
        </Badge>
        <Badge variant="outline">
          {stats.unchanged} unchanged
        </Badge>
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
        {segments.map((seg, i) => {
          if (seg.added) {
            return (
              <span
                key={i}
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                {seg.value}
              </span>
            );
          }
          if (seg.removed) {
            return (
              <span
                key={i}
                className="bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300"
              >
                {seg.value}
              </span>
            );
          }
          return <span key={i}>{seg.value}</span>;
        })}
      </div>
    </div>
  );
}
