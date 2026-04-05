// App 5: Portfolio Continuity Dashboard
// Measures and improves portfolio continuity

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Clock,
  Lightbulb,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AssetCategory } from "../../types";
import { ASSET_CATEGORY_LABELS } from "../../types";

interface PortfolioInput {
  totalValue: number;
  currency: "EUR" | "USD" | "CHF" | "GBP";
  allocation: Record<AssetCategory, number>;
}

interface OrganizationStatus {
  hasExecutor: boolean;
  hasBeneficiary: boolean;
  hasQuorum: boolean;
  hasTimeDelay: boolean;
  hasDocumentation: boolean;
}

const ASSET_CATEGORIES: AssetCategory[] = [
  "crypto",
  "nft",
  "defi",
  "rwa",
  "business",
  "domain",
  "other",
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#6b7280"];

const PRESETS = {
  "crypto-heavy": { crypto: 50, defi: 20, nft: 10, rwa: 5, business: 5, domain: 5, other: 5 },
  entrepreneur: { crypto: 15, business: 40, rwa: 20, defi: 5, nft: 5, domain: 10, other: 5 },
  rwa: { crypto: 20, rwa: 40, defi: 10, nft: 5, business: 15, domain: 5, other: 5 },
  defi: { crypto: 25, defi: 40, nft: 10, rwa: 10, business: 5, domain: 5, other: 5 },
  balanced: { crypto: 25, rwa: 20, defi: 15, nft: 10, business: 15, domain: 10, other: 5 },
};

export function ContinuityDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioInput>({
    totalValue: 500000,
    currency: "EUR",
    allocation: PRESETS["crypto-heavy"],
  });

  const [orgStatus, setOrgStatus] = useState<OrganizationStatus>({
    hasExecutor: false,
    hasBeneficiary: false,
    hasQuorum: false,
    hasTimeDelay: false,
    hasDocumentation: false,
  });

  // Calculate continuity score
  const continuityScore = useMemo(() => {
    let score = 30; // Base score

    // Allocation factors
    const selfCustodyWeight = portfolio.allocation.crypto + portfolio.allocation.defi;
    score += Math.min(selfCustodyWeight * 0.3, 15);

    const businessWeight = portfolio.allocation.business;
    score += Math.min(businessWeight * 0.2, 10);

    // Organization factors
    if (orgStatus.hasExecutor) score += 10;
    if (orgStatus.hasBeneficiary) score += 10;
    if (orgStatus.hasQuorum) score += 10;
    if (orgStatus.hasTimeDelay) score += 5;
    if (orgStatus.hasDocumentation) score += 10;

    return Math.min(Math.round(score), 100);
  }, [portfolio, orgStatus]);

  // Determine maturity level
  const maturityLevel = useMemo(() => {
    if (continuityScore >= 80) return "audit-ready";
    if (continuityScore >= 60) return "controlled";
    if (continuityScore >= 40) return "defined";
    return "ad-hoc";
  }, [continuityScore]);

  const maturityLabels: Record<string, { label: string; color: string }> = {
    "ad-hoc": { label: "Ad-hoc", color: "bg-red-500" },
    defined: { label: "Defined", color: "bg-amber-500" },
    controlled: { label: "Controlled", color: "bg-blue-500" },
    "audit-ready": { label: "Audit-Ready", color: "bg-green-500" },
  };

  // Generate breakpoints
  const breakpoints = useMemo(() => {
    const issues: { severity: "critical" | "high" | "medium" | "low"; text: string }[] = [];

    if (!orgStatus.hasExecutor) {
      issues.push({ severity: "critical", text: "No executor designated" });
    }
    if (!orgStatus.hasBeneficiary) {
      issues.push({ severity: "critical", text: "No beneficiary designated" });
    }
    if (portfolio.allocation.crypto > 30 && !orgStatus.hasDocumentation) {
      issues.push({ severity: "high", text: "High crypto allocation without documentation" });
    }
    if (!orgStatus.hasQuorum) {
      issues.push({ severity: "high", text: "No multi-signature/quorum configured" });
    }
    if (!orgStatus.hasTimeDelay) {
      issues.push({ severity: "medium", text: "No time delay for sensitive operations" });
    }
    if (portfolio.allocation.business > 20 && !orgStatus.hasDocumentation) {
      issues.push({ severity: "medium", text: "Business accounts need documented access" });
    }

    return issues;
  }, [portfolio, orgStatus]);

  // Fast fixes
  const fastFixes = [
    { title: "Designate Executor", time: "5 min", impact: "+10 points" },
    { title: "Add Beneficiary", time: "5 min", impact: "+10 points" },
    { title: "Document Assets", time: "15 min", impact: "+10 points" },
    { title: "Set Quorum", time: "10 min", impact: "+10 points" },
    { title: "Add Time Delay", time: "5 min", impact: "+5 points" },
  ];

  // Allocation total for validation
  const allocationTotal = useMemo(
    () => Object.values(portfolio.allocation).reduce((sum, v) => sum + v, 0),
    [portfolio.allocation]
  );

  // Update allocation
  const updateAllocation = (category: AssetCategory, value: number) => {
    setPortfolio((p) => ({
      ...p,
      allocation: { ...p.allocation, [category]: value },
    }));
  };

  // Apply preset
  const applyPreset = (preset: keyof typeof PRESETS) => {
    setPortfolio((p) => ({
      ...p,
      allocation: PRESETS[preset],
    }));
  };

  // Chart data
  const pieData = Object.entries(portfolio.allocation)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: ASSET_CATEGORY_LABELS[k as AssetCategory], value: v }));

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Portfolio Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PRESETS).map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset as keyof typeof PRESETS)}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={portfolio.currency}
                  onValueChange={(v: PortfolioInput["currency"]) =>
                    setPortfolio((p) => ({ ...p, currency: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={portfolio.totalValue}
                  onChange={(e) =>
                    setPortfolio((p) => ({
                      ...p,
                      totalValue: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ASSET_CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{ASSET_CATEGORY_LABELS[cat]}</span>
                    <span className="text-slate-500">{portfolio.allocation[cat]}%</span>
                  </div>
                  <Slider
                    value={[portfolio.allocation[cat]]}
                    onValueChange={([v]) => updateAllocation(cat, v)}
                    max={100}
                    step={5}
                  />
                </div>
              ))}
              <div
                className={`flex justify-between items-center pt-2 mt-2 border-t text-sm font-medium ${
                  allocationTotal === 100
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>Total</span>
                <span>{allocationTotal}%{allocationTotal !== 100 && " (must be 100%)"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Organization Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Governance Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "hasExecutor", label: "Executor designated" },
                { key: "hasBeneficiary", label: "Beneficiary designated" },
                { key: "hasQuorum", label: "Multi-sig/Quorum configured" },
                { key: "hasTimeDelay", label: "Time delay enabled" },
                { key: "hasDocumentation", label: "Documentation complete" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Checkbox
                    checked={orgStatus[item.key as keyof OrganizationStatus]}
                    onCheckedChange={(checked) =>
                      setOrgStatus((s) => ({ ...s, [item.key]: checked }))
                    }
                  />
                  <Label className="text-sm">{item.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Continuity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-6xl font-bold">{continuityScore}</div>
                  <div className="text-sm text-slate-500">out of 100</div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Maturity Level</span>
                    <Badge className={maturityLabels[maturityLevel].color}>
                      {maturityLabels[maturityLevel].label}
                    </Badge>
                  </div>
                  <Progress value={continuityScore} className="h-3" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Ad-hoc</span>
                    <span>Defined</span>
                    <span>Controlled</span>
                    <span>Audit-Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Portfolio Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Coverage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { name: "Executor", value: orgStatus.hasExecutor ? 100 : 0 },
                      { name: "Beneficiary", value: orgStatus.hasBeneficiary ? 100 : 0 },
                      { name: "Quorum", value: orgStatus.hasQuorum ? 100 : 0 },
                      { name: "Time Delay", value: orgStatus.hasTimeDelay ? 100 : 0 },
                      { name: "Docs", value: orgStatus.hasDocumentation ? 100 : 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Breakpoints */}
          {breakpoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  Top Breakpoints ({breakpoints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {breakpoints.map((bp, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        bp.severity === "critical"
                          ? "bg-red-50 border border-red-200"
                          : bp.severity === "high"
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <Badge
                        variant={
                          bp.severity === "critical"
                            ? "destructive"
                            : bp.severity === "high"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {bp.severity}
                      </Badge>
                      <span className="text-sm">{bp.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fast Fixes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Zap className="w-5 h-5" />
                Fast Fixes (30 minutes or less)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fastFixes.map((fix, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200"
                  >
                    <div className="font-medium text-sm">{fix.title}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fix.time}
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        {fix.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maturity Stages */}
          <Card>
            <CardHeader>
              <CardTitle>Maturity Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 1, name: "Ad-hoc", desc: "No formal process" },
                  { level: 2, name: "Defined", desc: "Basic roles assigned" },
                  { level: 3, name: "Controlled", desc: "Policies in place" },
                  { level: 4, name: "Audit-Ready", desc: "Full documentation" },
                ].map((stage) => (
                  <div
                    key={stage.level}
                    className={`p-4 rounded-lg text-center ${
                      (maturityLevel === "ad-hoc" && stage.level === 1) ||
                      (maturityLevel === "defined" && stage.level === 2) ||
                      (maturityLevel === "controlled" && stage.level === 3) ||
                      (maturityLevel === "audit-ready" && stage.level === 4)
                        ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                        : "bg-slate-50 dark:bg-slate-800 border border-slate-200"
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1">{stage.level}</div>
                    <div className="font-medium text-sm">{stage.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{stage.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
