import { useState } from "react";
import { Download, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePipelineStore, getProfile } from "../../store/pipeline-store";
import { assembleDocument, downloadDocument } from "../../utils/exporter";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<"txt" | "md">("md");

  const masterDocument = usePipelineStore((s) => s.masterDocument);
  const blocks = usePipelineStore((s) => s.blocks);
  const rewrites = usePipelineStore((s) => s.rewrites);
  const profileId = usePipelineStore((s) => s.profileId);
  const harmonizationResult = usePipelineStore((s) => s.harmonizationResult);

  const profile = getProfile(profileId);

  const committed = Object.values(rewrites).filter(
    (r) => r.status === "committed"
  ).length;
  const skipped = Object.values(rewrites).filter(
    (r) => r.status === "skipped"
  ).length;

  const handleExport = () => {
    if (!masterDocument) return;

    const content = assembleDocument(
      masterDocument,
      blocks,
      rewrites,
      harmonizationResult,
      profile.name
    );

    downloadDocument(content, masterDocument.fileName, format);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Export the rewritten document with Table of Contents and Glossary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Committed: </span>
              <span className="font-medium">{committed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Skipped: </span>
              <span className="font-medium">{skipped}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium">{blocks.length}</span>
            </div>
          </div>

          {/* Harmonization Summary */}
          {harmonizationResult && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Harmonization Report</p>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1 text-xs">
                    {harmonizationResult.terminologyIssues.length === 0 &&
                      harmonizationResult.crossRefIssues.length === 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="size-3.5" />
                          All checks passed
                        </div>
                      )}
                    {harmonizationResult.terminologyIssues.map((issue, i) => (
                      <div key={`t-${i}`} className="flex items-start gap-2">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
                        <span>{issue.message}</span>
                      </div>
                    ))}
                    {harmonizationResult.crossRefIssues.map((issue, i) => (
                      <div key={`c-${i}`} className="flex items-start gap-2">
                        {issue.severity === "error" ? (
                          <XCircle className="size-3.5 shrink-0 mt-0.5 text-red-500" />
                        ) : (
                          <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
                        )}
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {harmonizationResult.toc.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary">
                      {harmonizationResult.toc.length} chapters in TOC
                    </Badge>
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(harmonizationResult.glossaryTerms).length} glossary terms
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as "txt" | "md")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4" />
                    Markdown (.md)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4" />
                    Plain Text (.txt)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-1 size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
