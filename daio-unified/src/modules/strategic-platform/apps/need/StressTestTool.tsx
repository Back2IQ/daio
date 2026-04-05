import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  TestTube,
  Skull,
  Brain,
  Scale,
  Plane,
  UserX,
  AlertTriangle,
  Lock,
  Clock,
  DollarSign,
  Shield,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/calculations";
import type { StressEvent } from "../../types";

interface AssetCategory {
  id: string;
  name: string;
  value: number;
  blockedBy: StressEvent[];
  recoveryMonths: number;
  legalCostPercent: number;
}

const STRESS_EVENTS: { id: StressEvent; name: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "death",
    name: "Tod",
    icon: <Skull className="w-4 h-4" />,
    description: "Vollständiger Ausfall des Eigentümers",
  },
  {
    id: "incapacity",
    name: "Inkapazität",
    icon: <Brain className="w-4 h-4" />,
    description: "Geschäftsunfähigkeit durch Krankheit/Unfall",
  },
  {
    id: "divorce",
    name: "Scheidung",
    icon: <Scale className="w-4 h-4" />,
    description: "Vermögensauseinandersetzung",
  },
  {
    id: "relocation",
    name: "Umzug ins Ausland",
    icon: <Plane className="w-4 h-4" />,
    description: "Internationale Verlagerung",
  },
  {
    id: "trustee-failure",
    name: "Treuhänder-Ausfall",
    icon: <UserX className="w-4 h-4" />,
    description: "Ausfall eines Vertrauensperson",
  },
];

const DEFAULT_ASSETS: AssetCategory[] = [
  { id: "crypto", name: "Crypto", value: 200000, blockedBy: ["death", "incapacity"], recoveryMonths: 12, legalCostPercent: 5 },
  { id: "defi", name: "DeFi", value: 100000, blockedBy: ["death", "incapacity", "trustee-failure"], recoveryMonths: 18, legalCostPercent: 8 },
  { id: "exchange", name: "Exchange", value: 80000, blockedBy: ["death", "incapacity", "divorce"], recoveryMonths: 6, legalCostPercent: 3 },
  { id: "business", name: "Business", value: 150000, blockedBy: ["death", "incapacity", "divorce", "trustee-failure"], recoveryMonths: 24, legalCostPercent: 10 },
  { id: "domain", name: "Domains", value: 20000, blockedBy: ["death", "incapacity"], recoveryMonths: 3, legalCostPercent: 2 },
];

export function StressTestTool() {
  const [selectedEvent, setSelectedEvent] = useState<StressEvent>("death");
  const [assets, setAssets] = useState<AssetCategory[]>(DEFAULT_ASSETS);
  const [hasDaio, setHasDaio] = useState(false);

  const updateAssetValue = (id: string, value: number) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, value } : a))
    );
  };

  const results = useMemo(() => {
    const blockedAssets = assets.filter((a) => a.blockedBy.includes(selectedEvent));
    const blockedValue = blockedAssets.reduce((sum, a) => sum + a.value, 0);
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    
    const avgRecoveryMonths =
      blockedAssets.length > 0
        ? blockedAssets.reduce((sum, a) => sum + a.recoveryMonths, 0) / blockedAssets.length
        : 0;
    
    const legalCosts = blockedAssets.reduce(
      (sum, a) => sum + a.value * (a.legalCostPercent / 100),
      0
    );

    const riskScore = Math.min((blockedValue / totalValue) * 100, 100);
    
    // With DAIO: estimated reductions based on structured governance
    // (illustrative assumptions — actual impact depends on implementation scope)
    const blockedValueWithDaio = hasDaio ? blockedValue * 0.1 : blockedValue;       // ~90% reduction
    const legalCostsWithDaio = hasDaio ? legalCosts * 0.2 : legalCosts;             // ~80% reduction
    const recoveryMonthsWithDaio = hasDaio ? avgRecoveryMonths * 0.3 : avgRecoveryMonths; // ~70% reduction

    return {
      blockedValue,
      blockedValueWithDaio,
      totalValue,
      avgRecoveryMonths,
      recoveryMonthsWithDaio,
      legalCosts,
      legalCostsWithDaio,
      riskScore,
      blockedAssets,
    };
  }, [assets, selectedEvent, hasDaio]);

  const radarData = assets.map((asset) => ({
    subject: asset.name,
    A: asset.blockedBy.includes(selectedEvent) ? 80 : 20,
    fullMark: 100,
  }));

  const riskLevel =
    results.riskScore > 70 ? "critical" : results.riskScore > 40 ? "high" : "medium";

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Stress-Test Formel:</div>
        <div className="text-blue-600 dark:text-blue-400">
          R = Σ (Assetwert × Blockierungsfaktor × Event-Multiplikator)
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Simuliert Asset-Blockaden bei verschiedenen Lebensereignissen
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-base">Stress-Szenario</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {STRESS_EVENTS.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      selectedEvent === event.id
                        ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
                        : "bg-slate-50 dark:bg-slate-800 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedEvent === event.id
                          ? "bg-purple-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {event.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-slate-500">{event.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Asset Values */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Asset-Werte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{asset.name}</span>
                    <span className="font-mono">{formatCurrency(asset.value)}</span>
                  </div>
                  <Slider
                    value={[asset.value]}
                    onValueChange={([v]) => updateAssetValue(asset.id, v)}
                    min={0}
                    max={500000}
                    step={10000}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* DAIO Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="daio"
                  checked={hasDaio}
                  onCheckedChange={(c) => setHasDaio(!!c)}
                />
                <Label htmlFor="daio" className="cursor-pointer">
                  <div className="font-medium">Mit DAIO-Governance</div>
                  <div className="text-xs text-slate-500">
                    Simuliert Impact mit DAIO-Struktur
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Annahmen: ~90% Wertschutz, ~80% Rechtskostenreduktion, ~70% schnellere Recovery (illustrativ)
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Risk Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-slate-500">Risiko-Score</div>
                  <div className="text-3xl font-bold">{results.riskScore.toFixed(0)}%</div>
                </div>
                <Badge
                  variant={riskLevel === "critical" ? "destructive" : "default"}
                  className={
                    riskLevel === "high"
                      ? "bg-orange-500"
                      : riskLevel === "medium"
                      ? "bg-amber-500"
                      : ""
                  }
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {riskLevel === "critical" && "Kritisch"}
                  {riskLevel === "high" && "Hoch"}
                  {riskLevel === "medium" && "Mittel"}
                </Badge>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    riskLevel === "critical"
                      ? "bg-red-500"
                      : riskLevel === "high"
                      ? "bg-orange-500"
                      : riskLevel === "medium"
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${results.riskScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Impact Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <Lock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Blockierter Wert</div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(hasDaio ? results.blockedValueWithDaio : results.blockedValue)}
                </div>
                {!hasDaio && (
                  <div className="text-xs text-red-600">
                    von {formatCurrency(results.totalValue)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Wiederherstellung</div>
                <div className="text-lg font-bold text-amber-700">
                  {hasDaio
                    ? results.recoveryMonthsWithDaio.toFixed(1)
                    : results.avgRecoveryMonths.toFixed(1)}{" "}
                  Monate
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Rechtskosten</div>
                <div className="text-lg font-bold text-orange-700">
                  {formatCurrency(hasDaio ? results.legalCostsWithDaio : results.legalCosts)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Asset-Risiko-Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Blockierungsrisiko"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Blocked Assets List */}
          {results.blockedAssets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <CardTitle className="text-base">Betroffene Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.blockedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-2 bg-red-50 rounded"
                    >
                      <span className="text-sm font-medium">{asset.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-mono">{formatCurrency(asset.value)}</div>
                        <div className="text-xs text-slate-500">
                          {asset.recoveryMonths} Monate Wiederherstellung
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
