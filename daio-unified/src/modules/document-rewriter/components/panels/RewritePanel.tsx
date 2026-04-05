import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePipelineStore } from "../../store/pipeline-store";
import { usePipeline } from "../../hooks/use-pipeline";
import { BLOCK_STATUS_LABELS } from "../../types";

export function RewritePanel() {
  const blocks = usePipelineStore((s) => s.blocks);
  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const rewrites = usePipelineStore((s) => s.rewrites);
  const updateRewriteText = usePipelineStore((s) => s.updateRewriteText);
  const masterDocument = usePipelineStore((s) => s.masterDocument);

  const { isProcessing, error, processCurrentBlock, revalidateCurrentBlock } =
    usePipeline();

  const block = blocks[currentBlockIndex];
  if (!block || !masterDocument) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No block selected
      </div>
    );
  }

  const rewrite = rewrites[block.id];
  const chapter = masterDocument.chapters.find((ch) => ch.id === block.chapterId);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div>
          <p className="text-sm font-semibold">
            Block {currentBlockIndex + 1} of {blocks.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {chapter?.title} — {block.wordCount} words
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rewrite && (
            <Badge
              variant={
                rewrite.status === "committed"
                  ? "default"
                  : rewrite.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
            >
              {BLOCK_STATUS_LABELS[rewrite.status]}
            </Badge>
          )}
          {rewrite?.attempts > 0 && (
            <span className="text-xs text-muted-foreground">
              Attempt {rewrite.attempts}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Original Text */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Original</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {block.originalText}
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Rewrite Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Rewrite</h3>
              {!rewrite?.rewrittenText && !isProcessing && (
                <Button size="sm" onClick={processCurrentBlock}>
                  <Sparkles className="mr-1 size-3" />
                  Generate Rewrite
                </Button>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Rewriting block...
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {rewrite?.rewrittenText && !isProcessing && (
              <Textarea
                value={rewrite.rewrittenText}
                onChange={(e) => {
                  updateRewriteText(block.id, e.target.value);
                  revalidateCurrentBlock();
                }}
                className="min-h-[200px] text-sm leading-relaxed"
              />
            )}

            {/* Rationale */}
            {rewrite?.rationale && !isProcessing && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Rationale
                </p>
                <p className="text-xs text-muted-foreground">
                  {rewrite.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
