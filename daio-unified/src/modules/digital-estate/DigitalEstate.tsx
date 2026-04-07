import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, ShieldAlert } from "lucide-react";
import AssetInventory from "./apps/inventory/AssetInventory";
import RiskAssessment from "./apps/risk-assessment/RiskAssessment";
import type { DigitalAsset, RiskAnswer, TabId } from "./types";

const STORAGE_KEY = "daio-digital-estate";

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveState(key: string, value: unknown) {
  localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value));
}

export default function DigitalEstate() {
  const [tab, setTab] = useState<TabId>("inventory");
  const [assets, setAssets] = useState<DigitalAsset[]>(() => loadState("assets", []));
  const [answers, setAnswers] = useState<RiskAnswer[]>(() => loadState("answers", []));
  const [currency, setCurrency] = useState<"EUR" | "USD">(() => loadState("currency", "EUR"));

  useEffect(() => saveState("assets", assets), [assets]);
  useEffect(() => saveState("answers", answers), [answers]);
  useEffect(() => saveState("currency", currency), [currency]);

  const handleAssetsChange = useCallback((a: DigitalAsset[]) => setAssets(a), []);
  const handleAnswersChange = useCallback((a: RiskAnswer[]) => setAnswers(a), []);
  const handleCurrencyChange = useCallback((c: "EUR" | "USD") => setCurrency(c), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Digital Estate</h1>
              <p className="text-sm text-muted-foreground">
                Inventory your digital assets. Assess your succession risk.
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
              <TabsList>
                <TabsTrigger value="inventory" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  <span className="hidden sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger value="risk-assessment" className="gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Risk Assessment</span>
                  {assets.length > 0 && answers.length === 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === "inventory" && (
          <AssetInventory
            assets={assets}
            currency={currency}
            onAssetsChange={handleAssetsChange}
            onCurrencyChange={handleCurrencyChange}
          />
        )}
        {tab === "risk-assessment" && (
          <RiskAssessment
            assets={assets}
            answers={answers}
            currency={currency}
            onAnswersChange={handleAnswersChange}
          />
        )}
      </main>
    </div>
  );
}
