import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  Lock,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Shield,
} from "lucide-react";
import {
  calculatePortfolioErosion,
  formatCurrency,
  generateLossScenarios,
} from "../../utils/calculations";
import type { PortfolioInput, CustodyType } from "../../types";

export function LossSimulator() {
  const [portfolio, setPortfolio] = useState<PortfolioInput>({
    totalValue: 500000,
    cryptoPercent: 40,
    defiPercent: 25,
    exchangePercent: 20,
    custodyType: "self",
    hasDocumentation: false,
    hasExecutor: false,
  });

  const [selectedDay, setSelectedDay] = useState(30);

  const scenarios = useMemo(
    () => generateLossScenarios(portfolio),
    [portfolio]
  );

  const currentErosion = useMemo(
    () => calculatePortfolioErosion(portfolio, selectedDay),
    [portfolio, selectedDay]
  );

  const chartData = scenarios.map((s) => ({
    day: s.label,
    recoverable: s.withoutDaio.recoverableValue,
    frozen: s.withoutDaio.frozenValue,
    lost: s.withoutDaio.lostValue,
  }));

  const totalValue = portfolio.totalValue;
  const recoverablePercent = (currentErosion.recoverable / totalValue) * 100;
  const frozenPercent = (currentErosion.frozen / totalValue) * 100;
  const lostPercent = (currentErosion.lost / totalValue) * 100;

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Mathematical model:</div>
        <div className="text-blue-600 dark:text-blue-400">
          V(t) = V₀ × e^(-λt)
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          λ = decay rate (Self: 1.5%/day, Exchange: 0.5%/day, Inst: 0.2%/day, Hybrid: 0.8%/day)
        </div>
        <div className="text-amber-600 dark:text-amber-400 text-xs mt-1">
          Modeled estimates — actual loss rates vary case by case
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Portfolio Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Total Value */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Total value</Label>
                  <span className="font-mono font-medium">
                    {formatCurrency(portfolio.totalValue)}
                  </span>
                </div>
                <Slider
                  value={[portfolio.totalValue]}
                  onValueChange={([v]) =>
                    setPortfolio((p) => ({ ...p, totalValue: v }))
                  }
                  min={50000}
                  max={5000000}
                  step={50000}
                />
              </div>

              {/* Asset Allocation */}
              <div className="space-y-4">
                <Label>Asset allocation</Label>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Crypto (Self-Custody)</span>
                    <span>{portfolio.cryptoPercent}%</span>
                  </div>
                  <Slider
                    value={[portfolio.cryptoPercent]}
                    onValueChange={([v]) =>
                      setPortfolio((p) => ({ ...p, cryptoPercent: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>DeFi positions</span>
                    <span>{portfolio.defiPercent}%</span>
                  </div>
                  <Slider
                    value={[portfolio.defiPercent]}
                    onValueChange={([v]) =>
                      setPortfolio((p) => ({ ...p, defiPercent: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exchange accounts</span>
                    <span>{portfolio.exchangePercent}%</span>
                  </div>
                  <Slider
                    value={[portfolio.exchangePercent]}
                    onValueChange={([v]) =>
                      setPortfolio((p) => ({ ...p, exchangePercent: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              {/* Custody Type */}
              <div className="space-y-2">
                <Label>Primary custody type</Label>
                <Select
                  value={portfolio.custodyType}
                  onValueChange={(v) =>
                    setPortfolio((p) => ({ ...p, custodyType: v as CustodyType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self-Custody (Wallet)</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                    <SelectItem value="hybrid">Hybrid/Multi-sig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="docs"
                    checked={portfolio.hasDocumentation}
                    onCheckedChange={(c) =>
                      setPortfolio((p) => ({ ...p, hasDocumentation: !!c }))
                    }
                  />
                  <Label htmlFor="docs" className="text-sm cursor-pointer">
                    Documentation in place
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="executor"
                    checked={portfolio.hasExecutor}
                    onCheckedChange={(c) =>
                      setPortfolio((p) => ({ ...p, hasExecutor: !!c }))
                    }
                  />
                  <Label htmlFor="executor" className="text-sm cursor-pointer">
                    Executor arrangement defined
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slider */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Time elapsed after incident</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Day {selectedDay}</span>
                  <Badge variant="outline">{selectedDay} days</Badge>
                </div>
                <Slider
                  value={[selectedDay]}
                  onValueChange={([v]) => setSelectedDay(v)}
                  min={0}
                  max={180}
                  step={1}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Day 0</span>
                  <span>90</span>
                  <span>180</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Recoverable</div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(currentErosion.recoverable)}
                </div>
                <div className="text-xs text-green-600">{recoverablePercent.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 text-center">
                <Lock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Frozen</div>
                <div className="text-lg font-bold text-amber-700">
                  {formatCurrency(currentErosion.frozen)}
                </div>
                <div className="text-xs text-amber-600">{frozenPercent.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Lost</div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(currentErosion.lost)}
                </div>
                <div className="text-xs text-red-600">{lostPercent.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Value decay over time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      labelStyle={{ color: "#666" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="recoverable"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                      name="Recoverable"
                    />
                    <Area
                      type="monotone"
                      dataKey="frozen"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Frozen"
                    />
                    <Area
                      type="monotone"
                      dataKey="lost"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Lost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm">Without DAIO</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• No documented access</li>
                  <li>• Unclear inheritance structure</li>
                  <li>• Legal blockages possible</li>
                  <li>• DeFi positions expire</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <CardTitle className="text-sm">With DAIO</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• Complete documentation</li>
                  <li>• Clear executor structure</li>
                  <li>• Legally sound transfer</li>
                  <li>• 98% value preservation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
