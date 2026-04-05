import { useState } from "react";
import { Check, RefreshCw, SkipForward, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePipelineStore } from "../../store/pipeline-store";
import { usePipeline } from "../../hooks/use-pipeline";

export function BlockActions() {
  const [constraint, setConstraint] = useState("");
  const [showConstraint, setShowConstraint] = useState(false);

  const blocks = usePipelineStore((s) => s.blocks);
  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const rewrites = usePipelineStore((s) => s.rewrites);

  const {
    isProcessing,
    processCurrentBlock,
    regenerateBlock,
    commitCurrentBlock,
    skipCurrentBlock,
    runHarmonization,
    allBlocksDone,
  } = usePipeline();

  const block = blocks[currentBlockIndex];
  if (!block) return null;

  const rewrite = rewrites[block.id];
  const hasRewrite = !!rewrite?.rewrittenText;
  const canCommit = hasRewrite && rewrite?.allRulesPassed && rewrite?.status === "review";
  const isCommitted = rewrite?.status === "committed";
  const isSkipped = rewrite?.status === "skipped";
  const isDone = allBlocksDone();

  const handleRegenerate = () => {
    if (showConstraint && constraint.trim()) {
      regenerateBlock(constraint.trim());
      setConstraint("");
      setShowConstraint(false);
    } else {
      setShowConstraint(true);
    }
  };

  return (
    <div className="space-y-2">
      {isDone && (
        <Button className="w-full" onClick={runHarmonization}>
          <ArrowRight className="mr-1 size-4" />
          Run Harmonization
        </Button>
      )}

      {!isDone && (
        <>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!canCommit || isProcessing}
              onClick={commitCurrentBlock}
            >
              <Check className="mr-1 size-3" />
              Commit
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
              onClick={hasRewrite ? handleRegenerate : processCurrentBlock}
            >
              <RefreshCw className="mr-1 size-3" />
              {hasRewrite ? "Regen" : "Generate"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing || isCommitted}
              onClick={skipCurrentBlock}
              title="Skip this block"
            >
              <SkipForward className="size-3" />
            </Button>
          </div>

          {showConstraint && (
            <div className="flex gap-2">
              <Input
                placeholder="Add constraint (e.g. 'more formal tone')"
                value={constraint}
                onChange={(e) => setConstraint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && constraint.trim()) {
                    regenerateBlock(constraint.trim());
                    setConstraint("");
                    setShowConstraint(false);
                  }
                }}
                className="flex-1 text-xs"
              />
              <Button
                size="sm"
                disabled={!constraint.trim() || isProcessing}
                onClick={() => {
                  regenerateBlock(constraint.trim());
                  setConstraint("");
                  setShowConstraint(false);
                }}
              >
                Go
              </Button>
            </div>
          )}

          {isCommitted && (
            <p className="text-xs text-green-600 text-center">Block committed</p>
          )}
          {isSkipped && (
            <p className="text-xs text-muted-foreground text-center">Block skipped</p>
          )}
          {hasRewrite && !rewrite?.allRulesPassed && rewrite?.status === "review" && (
            <p className="text-xs text-amber-600 text-center">
              Fix rule violations before committing
            </p>
          )}
        </>
      )}
    </div>
  );
}
