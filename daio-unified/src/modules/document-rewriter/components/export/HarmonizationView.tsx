import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePipelineStore } from "../../store/pipeline-store";

interface HarmonizationViewProps {
  onExport: () => void;
}

export function HarmonizationView({ onExport }: HarmonizationViewProps) {
  const harmonizationResult = usePipelineStore((s) => s.harmonizationResult);
  const blocks = usePipelineStore((s) => s.blocks);
  const rewrites = usePipelineStore((s) => s.rewrites);
  const setPhase = usePipelineStore((s) => s.setPhase);

  const committed = Object.values(rewrites).filter(
    (r) => r.status === "committed"
  ).length;
  const skipped = Object.values(rewrites).filter(
    (r) => r.status === "skipped"
  ).length;

  if (!harmonizationResult) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No harmonization results yet
      </div>
    );
  }

  const allIssues = [
    ...harmonizationResult.terminologyIssues,
    ...harmonizationResult.crossRefIssues,
  ];
  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Harmonization Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="flex gap-4">
            <Badge variant="outline">
              {committed} blocks committed
            </Badge>
            <Badge variant="outline">
              {skipped} blocks skipped
            </Badge>
            <Badge variant="outline">
              {blocks.length} total
            </Badge>
          </div>

          {/* Overall status */}
          {harmonizationResult.allPassed ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="size-5" />
              <span className="font-medium">All harmonization checks passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" />
              <span className="font-medium">
                {errors.length} error(s), {warnings.length} warning(s) found
              </span>
            </div>
          )}

          <Separator />

          {/* Issues */}
          {allIssues.length > 0 && (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {allIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border p-2 text-sm"
                  >
                    {issue.severity === "error" ? (
                      <XCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-blue-500" />
                    )}
                    <div>
                      <p>{issue.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Type: {issue.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* TOC Preview */}
          {harmonizationResult.toc.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Table of Contents</p>
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                {harmonizationResult.toc.map((title, i) => (
                  <p key={i}>
                    {i + 1}. {title}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Glossary Preview */}
          {Object.keys(harmonizationResult.glossaryTerms).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Glossary ({Object.keys(harmonizationResult.glossaryTerms).length} terms)
              </p>
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                {Object.entries(harmonizationResult.glossaryTerms)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([term, def]) => (
                    <p key={term}>
                      <span className="font-medium">{term}:</span> {def}
                    </p>
                  ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase("rewriting")}>
              <ArrowLeft className="mr-1 size-4" />
              Back to Editing
            </Button>
            <Button className="flex-1" onClick={onExport}>
              <Download className="mr-1 size-4" />
              Export Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
