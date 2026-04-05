import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BlockNavigator } from "../pipeline/BlockNavigator";
import { ProgressBar } from "../pipeline/ProgressBar";
import { usePipelineStore } from "../../store/pipeline-store";
import { cn } from "@/lib/utils";

export function MasterDocPanel() {
  const masterDocument = usePipelineStore((s) => s.masterDocument);

  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const setCurrentBlock = usePipelineStore((s) => s.setCurrentBlock);

  if (!masterDocument) return null;

  return (
    <div className="flex h-full flex-col border-r">
      <div className="border-b px-3 py-2">
        <h2 className="text-sm font-semibold">Master Document</h2>
        <p className="text-xs text-muted-foreground">{masterDocument.fileName}</p>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-1">
          {masterDocument.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground mt-2">
                {chapter.title}
              </p>
              {chapter.blocks.map((block) => (
                <button
                  key={block.id}
                  className={cn(
                    "w-full text-left rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent",
                    block.globalIndex === currentBlockIndex &&
                      "bg-primary/10 border border-primary/30 font-medium"
                  )}
                  onClick={() => setCurrentBlock(block.globalIndex)}
                >
                  <div className="flex items-center gap-2">
                    <BlockNavigator blockId={block.id} />
                    <span className="truncate">
                      Block {block.blockIndex + 1} — {block.wordCount}w
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-muted-foreground">
                    {block.originalText.slice(0, 80)}...
                  </p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <ProgressBar />
      </div>
    </div>
  );
}
