import { usePipelineStore } from "../../store/pipeline-store";
import { cn } from "@/lib/utils";
import { BLOCK_STATUS_COLORS } from "../../types";

interface BlockNavigatorProps {
  blockId: string;
}

export function BlockNavigator({ blockId }: BlockNavigatorProps) {
  const status = usePipelineStore((s) => s.rewrites[blockId]?.status ?? "pending");

  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        BLOCK_STATUS_COLORS[status]
      )}
      title={status}
    />
  );
}
