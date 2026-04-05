import { Settings, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePipelineStore } from "../../store/pipeline-store";
import { PROFILE_LABELS } from "../../types";

interface AppHeaderProps {
  onSettingsClick: () => void;
  onExportClick: () => void;
}

export function AppHeader({ onSettingsClick, onExportClick }: AppHeaderProps) {
  const phase = usePipelineStore((s) => s.phase);
  const profileId = usePipelineStore((s) => s.profileId);
  const blocks = usePipelineStore((s) => s.blocks);
  const rewrites = usePipelineStore((s) => s.rewrites);
  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const reset = usePipelineStore((s) => s.reset);

  const committed = Object.values(rewrites).filter(
    (r) => r.status === "committed" || r.status === "skipped"
  ).length;
  const total = blocks.length;
  const progress = total > 0 ? (committed / total) * 100 : 0;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">DAIO Rewriter</h1>
        {phase !== "upload" && (
          <>
            <Badge variant="outline">{PROFILE_LABELS[profileId]}</Badge>
            <span className="text-sm text-muted-foreground">
              Block {currentBlockIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      {phase !== "upload" && (
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="flex w-full max-w-xs items-center gap-2">
            <Progress value={progress} className="h-2" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {committed}/{total}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {(phase === "harmonizing" || phase === "completed") && (
          <Button variant="outline" size="sm" onClick={onExportClick}>
            <Download className="mr-1 size-4" />
            Export
          </Button>
        )}
        {phase !== "upload" && (
          <Button variant="ghost" size="icon-sm" onClick={reset} title="Start over">
            <RotateCcw className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onSettingsClick} title="Settings">
          <Settings className="size-4" />
        </Button>
      </div>
    </header>
  );
}
