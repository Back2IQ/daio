import { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, ShieldAlert, AlertTriangle } from "lucide-react";
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

      {/* Urgency Alerts */}
      <UrgencyAlerts assets={assets} />

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

function UrgencyAlerts({ assets }: { assets: DigitalAsset[] }) {
  const alerts = useMemo(() => {
    const now = Date.now();
    const result: { text: string; severity: "warning" | "critical" }[] = [];

    // Expiring domains
    for (const a of assets) {
      if (a.expiryDate) {
        const expiry = new Date(a.expiryDate).getTime();
        const daysLeft = Math.floor((expiry - now) / (24 * 60 * 60 * 1000));
        if (daysLeft < 0) {
          result.push({ text: `${a.name} expired ${Math.abs(daysLeft)} days ago — renewal access undocumented?`, severity: "critical" });
        } else if (daysLeft <= 90) {
          result.push({ text: `${a.name} expires in ${daysLeft} days — is renewal access documented?`, severity: "warning" });
        }
      }
    }

    // Undocumented high-value assets
    const undocHighValue = assets.filter((a) => a.governanceStatus === "undocumented" && (a.estimatedValue ?? 0) > 10000);
    if (undocHighValue.length > 0) {
      const total = undocHighValue.reduce((s, a) => s + (a.estimatedValue ?? 0), 0);
      result.push({
        text: `${undocHighValue.length} undocumented asset${undocHighValue.length > 1 ? "s" : ""} worth €${total.toLocaleString("en-US", { maximumFractionDigits: 0 })} — at risk without succession governance`,
        severity: "warning",
      });
    }

    return result;
  }, [assets]);

  if (alerts.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          a.severity === "critical" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{a.text}</span>
        </div>
      ))}
    </div>
  );
}
