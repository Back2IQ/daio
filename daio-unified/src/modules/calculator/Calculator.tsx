// DAIO Value Explorer - Main App

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  AlertTriangle,
  PieChart as PieChartIcon,
  Clock,
  DollarSign,
  Info,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { CalculatorInputs, PortfolioAllocation } from "./types";
import {
  PRESET_SCENARIOS,
  ALLOCATION_LABELS,
  CURRENCY_SYMBOLS,
} from "./types";
import {
  calculateAll,
  formatCurrency,
  formatPercentage,
  getContinuityRecommendation,
} from "./utils/calculator";
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

const DEFAULT_INPUTS: CalculatorInputs = {
  totalValue: 1000000, // Increased from 500000 to represent a more substantial portfolio
  allocation: {
    selfCustodyCrypto: 30,    // Reduced from 40 to allow for more diversified portfolio
    tokenizedRWA: 25,         // Increased from 20 to reflect growing RWA market
    defiPositions: 20,        // Increased from 15 to reflect DeFi importance
    nfts: 10,                 // Kept the same
    businessAccounts: 10,     // Kept the same
    other: 5,                 // Kept the same
  },
  riskWithoutDAIO: 12,        // Slightly increased to reflect higher risk without DAIO
  riskWithDAIO: 4,            // Slightly increased but still lower to show DAIO benefit
  timeHorizon: 10,            // Kept the same
  growthRate: 7,              // Increased from 6 to reflect more optimistic growth expectations
  daioCost: 15000,            // Increased from 10000 to reflect realistic implementation costs
  currency: "EUR",
};

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Validate allocation sums to 100%
  const allocationSum = Object.values(inputs.allocation).reduce((a, b) => a + b, 0);
  const allocationValid = allocationSum === 100;

  // Calculate results
  const results = useMemo(() => {
    if (!allocationValid) return null;
    try {
      return calculateAll(inputs);
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [inputs, allocationValid]);

  // Update allocation
  const updateAllocation = (key: keyof PortfolioAllocation, value: number) => {
    setInputs((prev) => ({
      ...prev,
      allocation: { ...prev.allocation, [key]: value },
    }));
  };

  // Apply preset scenario
  const applyScenario = (scenarioIndex: number) => {
    const scenario = PRESET_SCENARIOS[scenarioIndex];
    if (scenario.inputs) {
      setInputs((prev) => ({
        ...prev,
        ...scenario.inputs,
        allocation: scenario.inputs.allocation || prev.allocation,
      }));
    }
  };

  // Portfolio pie chart data
  const pieData = Object.entries(inputs.allocation)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: ALLOCATION_LABELS[key as keyof PortfolioAllocation],
      value,
    }));

  // Format value for display
  const fmt = (val: number) => formatCurrency(val, inputs.currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Back2IQ" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  DAIO Value Explorer
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Back2IQ — Ahead by Design
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              {/* Preset Scenarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Preset Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_SCENARIOS.map((scenario, idx) => (
                      <Button
                        key={scenario.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyScenario(idx)}
                        className="text-left justify-start"
                      >
                        {scenario.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Portfolio Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={inputs.currency}
                        onValueChange={(v: CalculatorInputs["currency"]) =>
                          setInputs((p) => ({ ...p, currency: v }))
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
                    </div>
                    <div className="space-y-2">
                      <Label>Total Value</Label>
                      <Input
                        type="number"
                        value={inputs.totalValue}
                        onChange={(e) =>
                          setInputs((p) => ({
                            ...p,
                            totalValue: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Asset Allocation
                    <Badge
                      variant={allocationValid ? "default" : "destructive"}
                    >
                      {allocationSum}%
                    </Badge>
                  </CardTitle>
                  {!allocationValid && (
                    <CardDescription className="text-red-500">
                      Total must equal 100%
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {(
                    Object.keys(ALLOCATION_LABELS) as Array<
                      keyof PortfolioAllocation
                    >
                  ).map((key) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">
                          {ALLOCATION_LABELS[key]}
                        </Label>
                        <span className="text-sm text-slate-500">
                          {inputs.allocation[key]}%
                        </span>
                      </div>
                      <Slider
                        value={[inputs.allocation[key]]}
                        onValueChange={([v]) => updateAllocation(key, v)}
                        max={100}
                        step={5}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Risk Without DAIO</Label>
                      <span className="text-sm text-slate-500">
                        {inputs.riskWithoutDAIO}%
                      </span>
                    </div>
                    <Slider
                      value={[inputs.riskWithoutDAIO]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, riskWithoutDAIO: v }))
                      }
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Risk With DAIO</Label>
                      <span className="text-sm text-slate-500">
                        {inputs.riskWithDAIO}%
                      </span>
                    </div>
                    <Slider
                      value={[inputs.riskWithDAIO]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, riskWithDAIO: v }))
                      }
                      min={0}
                      max={15}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Time & Growth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Time Horizon (years)</Label>
                      <span className="text-sm text-slate-500">
                        {inputs.timeHorizon}
                      </span>
                    </div>
                    <Slider
                      value={[inputs.timeHorizon]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, timeHorizon: v }))
                      }
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Annual Growth Rate</Label>
                      <span className="text-sm text-slate-500">
                        {inputs.growthRate}%
                      </span>
                    </div>
                    <Slider
                      value={[inputs.growthRate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, growthRate: v }))
                      }
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* DAIO Cost */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    DAIO Implementation Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Cost ({CURRENCY_SYMBOLS[inputs.currency]})</Label>
                    <Input
                      type="number"
                      value={inputs.daioCost}
                      onChange={(e) =>
                        setInputs((p) => ({
                          ...p,
                          daioCost: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              {results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-500">
                        Expected Prevented Loss
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {fmt(results.expectedPreventedLoss)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-500">Future Value</div>
                      <div className="text-2xl font-bold text-green-600">
                        {fmt(results.futureValue)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-500">
                        Future Prevented Loss
                      </div>
                      <div className="text-2xl font-bold text-amber-600">
                        {fmt(results.futurePreventedLoss)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-500">ROI</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(results.roi)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Continuity Score */}
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Continuity Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-4xl font-bold">
                          {results.continuityScore}
                        </span>
                        <Badge
                          className={
                            results.continuityScore >= 80
                              ? "bg-green-500"
                              : results.continuityScore >= 60
                                ? "bg-blue-500"
                                : results.continuityScore >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                          }
                        >
                          {results.continuityScore >= 80
                            ? "Excellent"
                            : results.continuityScore >= 60
                              ? "Good"
                              : results.continuityScore >= 40
                                ? "Moderate"
                                : "High Risk"}
                        </Badge>
                      </div>
                      <Progress
                        value={results.continuityScore}
                        className="h-3"
                      />
                      <p className="text-sm text-slate-500">
                        {getContinuityRecommendation(results.continuityScore)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              {results && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Portfolio Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Risk Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={[
                            {
                              name: "Without DAIO",
                              risk: inputs.riskWithoutDAIO,
                            },
                            { name: "With DAIO", risk: inputs.riskWithDAIO },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" />
                          <Tooltip />
                          <Bar dataKey="risk" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Time Horizon Chart */}
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projected Benefit Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.yearlyProjections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis
                          tickFormatter={(v) => fmt(v)}
                          width={80}
                        />
                        <Tooltip
                          formatter={(v: number) => fmt(v)}
                          labelFormatter={(l) => `Year ${l}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="portfolioValue"
                          name="Portfolio Value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="cumulativeBenefit"
                          name="Cumulative Benefit"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <Info className="w-5 h-5 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                  These calculations are estimates based on conservative
                  assumptions. Actual results may vary. This tool is for
                  educational purposes and does not constitute financial advice.
                  DAIO can reduce risk in many cases, but no solution can
                  eliminate all risks.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
      </div>
  );
}

export default App;
