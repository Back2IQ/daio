import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePipelineStore } from "../../store/pipeline-store";
import type { LLMProvider } from "../../types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = usePipelineStore((s) => s.settings);
  const updateLLMConfig = usePipelineStore((s) => s.updateLLMConfig);
  const updateSettings = usePipelineStore((s) => s.updateSettings);

  const [apiKey, setApiKey] = useState(settings.llmConfig.apiKey);
  const [provider, setProvider] = useState<LLMProvider>(settings.llmConfig.provider);
  const [model, setModel] = useState(settings.llmConfig.model);
  const [temperature, setTemperature] = useState(String(settings.llmConfig.temperature));
  const [autoAdvance, setAutoAdvance] = useState(settings.autoAdvance);

  const handleSave = () => {
    updateLLMConfig({
      apiKey,
      provider,
      model,
      temperature: parseFloat(temperature) || 0.3,
    });
    updateSettings({ autoAdvance });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your LLM provider and API key for document rewriting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider */}
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Select value={provider} onValueChange={(v) => {
              setProvider(v as LLMProvider);
              if (v === "openai" && !model.startsWith("gpt")) setModel("gpt-4o");
              if (v === "anthropic" && !model.startsWith("claude")) setModel("claude-sonnet-4-6");
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider === "openai" ? (
                  <>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
                    <SelectItem value="claude-haiku-4-5-20251001">Claude Haiku 4.5</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label>Temperature ({temperature})</Label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>

          {/* Auto-advance */}
          <div className="flex items-center justify-between">
            <Label>Auto-advance after commit</Label>
            <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
