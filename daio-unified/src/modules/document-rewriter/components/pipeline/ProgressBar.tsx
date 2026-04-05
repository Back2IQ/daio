import { Progress } from "@/components/ui/progress";
import { usePipelineStore } from "../../store/pipeline-store";

export function ProgressBar() {
  const blocks = usePipelineStore((s) => s.blocks);
  const rewrites = usePipelineStore((s) => s.rewrites);

  const committed = Object.values(rewrites).filter(
    (r) => r.status === "committed"
  ).length;
  const skipped = Object.values(rewrites).filter(
    (r) => r.status === "skipped"
  ).length;
  const total = blocks.length;
  const done = committed + skipped;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>
          {committed} committed, {skipped} skipped / {total} total
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
