import { useState, useCallback } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePipelineStore } from "../../store/pipeline-store";
import { PROFILE_LABELS } from "../../types";
import type { ProfileId } from "../../types";

export function UploadScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [rawContent, setRawContent] = useState<string>("");
  const [profileId, setProfileId] = useState<ProfileId>("institutional");
  const [wordCount, setWordCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startSession = usePipelineStore((s) => s.startSession);
  const apiKey = usePipelineStore((s) => s.settings.llmConfig.apiKey);

  const handleFile = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawContent(text);
      setFile(f);
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.name.endsWith(".txt") || droppedFile.name.endsWith(".md"))) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleStart = () => {
    if (!rawContent || !file) return;
    startSession(rawContent, file.name, profileId);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">DAIO Document Rewriter</CardTitle>
          <CardDescription>
            Upload your master document and select a target profile to begin the rewrite pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileInput}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="size-10 text-green-600" />
                <p className="font-medium">{file.name}</p>
                <Badge variant="secondary">{wordCount.toLocaleString()} words</Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="size-10" />
                <p className="font-medium">Drop your Master Document here</p>
                <p className="text-sm">or click to browse</p>
                <p className="text-xs">Supports: .txt, .md</p>
              </div>
            )}
          </div>

          {/* Profile Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Profile</label>
            <Select
              value={profileId}
              onValueChange={(v) => setProfileId(v as ProfileId)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PROFILE_LABELS) as [ProfileId, string][]).map(
                  ([id, label]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* API Key Warning */}
          {!apiKey && (
            <p className="text-sm text-amber-600">
              No API key configured. Click the settings icon in the header to add your OpenAI API key.
            </p>
          )}

          {/* Start Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!file || !rawContent}
            onClick={handleStart}
          >
            {!file ? (
              "Upload a document to begin"
            ) : (
              <>
                <Loader2 className="mr-2 size-4 animate-none" />
                Start Rewriting — {wordCount.toLocaleString()} words
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
