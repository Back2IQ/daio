import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiffView } from "../pipeline/DiffView";
import { RulesCheckPanel } from "../pipeline/RulesCheckPanel";
import { BlockActions } from "../pipeline/BlockActions";
import { usePipelineStore } from "../../store/pipeline-store";

export function InspectorPanel() {
  const blocks = usePipelineStore((s) => s.blocks);
  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const rewrites = usePipelineStore((s) => s.rewrites);

  const block = blocks[currentBlockIndex];
  if (!block) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No block selected
      </div>
    );
  }

  const rewrite = rewrites[block.id];
  const hasRewrite = !!rewrite?.rewrittenText;

  return (
    <div className="flex h-full flex-col border-l">
      <Tabs defaultValue="rules" className="flex h-full flex-col">
        <div className="border-b px-3 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="diff" className="flex-1">
              Diff
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex-1">
              Rules
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1">
              Info
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="diff" className="p-3 mt-0">
            {hasRewrite ? (
              <DiffView
                original={block.originalText}
                rewritten={rewrite.rewrittenText!}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Generate a rewrite to see the diff
              </p>
            )}
          </TabsContent>

          <TabsContent value="rules" className="p-3 mt-0">
            <RulesCheckPanel />
          </TabsContent>

          <TabsContent value="info" className="p-3 mt-0">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Chapter</p>
                <p className="text-muted-foreground">
                  {block.chapterIndex + 1}. Block {block.blockIndex + 1}
                </p>
              </div>
              <div>
                <p className="font-medium">Word Count</p>
                <p className="text-muted-foreground">{block.wordCount}</p>
              </div>
              <div>
                <p className="font-medium">Part</p>
                <p className="text-muted-foreground">
                  {block.metadata.partNumber ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Metadata</p>
                <ul className="text-muted-foreground text-xs space-y-0.5">
                  {block.metadata.isExecutiveSummary && <li>Executive Summary</li>}
                  {block.metadata.isPricingSection && <li>Pricing Section</li>}
                  {block.metadata.isAppendix && <li>Appendix</li>}
                  {block.metadata.isHeading && <li>Heading</li>}
                  {!block.metadata.isExecutiveSummary &&
                    !block.metadata.isPricingSection &&
                    !block.metadata.isAppendix &&
                    !block.metadata.isHeading && <li>Standard content block</li>}
                </ul>
              </div>
              {rewrite?.attempts > 0 && (
                <div>
                  <p className="font-medium">Attempts</p>
                  <p className="text-muted-foreground">{rewrite.attempts}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>

        {/* Actions always visible at bottom */}
        <div className="border-t p-3">
          <BlockActions />
        </div>
      </Tabs>
    </div>
  );
}
