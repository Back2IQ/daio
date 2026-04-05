import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  UserX,
  Server,
  CreditCard,
  Code,
  Mail,
  Database,
  Lock,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/calculations";

interface System {
  id: string;
  name: string;
  icon: React.ReactNode;
  downtimeCostPerHour: number;
  recoveryTimeHours: number;
  category: string;
}

const SYSTEMS: System[] = [
  {
    id: "server",
    name: "Servers & Infrastructure",
    icon: <Server className="w-4 h-4" />,
    downtimeCostPerHour: 5000,
    recoveryTimeHours: 48,
    category: "Infrastructure",
  },
  {
    id: "banking",
    name: "Business Banking",
    icon: <CreditCard className="w-4 h-4" />,
    downtimeCostPerHour: 3000,
    recoveryTimeHours: 72,
    category: "Financial",
  },
  {
    id: "code",
    name: "Code Repositories",
    icon: <Code className="w-4 h-4" />,
    downtimeCostPerHour: 2000,
    recoveryTimeHours: 24,
    category: "Development",
  },
  {
    id: "email",
    name: "Email & Communication",
    icon: <Mail className="w-4 h-4" />,
    downtimeCostPerHour: 1500,
    recoveryTimeHours: 12,
    category: "Communication",
  },
  {
    id: "database",
    name: "Databases & Backups",
    icon: <Database className="w-4 h-4" />,
    downtimeCostPerHour: 8000,
    recoveryTimeHours: 96,
    category: "Infrastructure",
  },
  {
    id: "access",
    name: "Admin Access & Keys",
    icon: <Lock className="w-4 h-4" />,
    downtimeCostPerHour: 4000,
    recoveryTimeHours: 168,
    category: "Security",
  },
];

export function KeyPersonRisk() {
  const [affectedSystems, setAffectedSystems] = useState<Set<string>>(new Set());
  const [hoursOffline, setHoursOffline] = useState(24);
  const [keyPersonSalary, setKeyPersonSalary] = useState(150000);

  const toggleSystem = (id: string) => {
    const newSet = new Set(affectedSystems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setAffectedSystems(newSet);
  };

  const impactData = useMemo(() => {
    return SYSTEMS.map((system) => {
      const isAffected = affectedSystems.has(system.id);
      const immediateCost = isAffected
        ? system.downtimeCostPerHour * Math.min(hoursOffline, system.recoveryTimeHours)
        : 0;
      const recoveryCost = isAffected
        ? system.downtimeCostPerHour * system.recoveryTimeHours
        : 0;
      // 30% of recovery cost added as indirect impact (productivity loss, opportunity cost)
      const totalImpact = immediateCost + recoveryCost * 0.3;

      return {
        name: system.name.split(" ")[0],
        fullName: system.name,
        immediateCost,
        recoveryCost,
        totalImpact,
        isAffected,
        recoveryTime: system.recoveryTimeHours,
      };
    });
  }, [affectedSystems, hoursOffline]);

  const totalImmediateImpact = impactData.reduce(
    (sum, item) => sum + item.immediateCost,
    0
  );
  const totalRecoveryCost = impactData.reduce(
    (sum, item) => sum + item.recoveryCost,
    0
  );
  const totalImpact = totalImmediateImpact + totalRecoveryCost * 0.3;

  const salaryEquivalent = keyPersonSalary / 2080; // hourly rate (40h/week × 52 weeks)
  // Loaded cost = 2× salary (includes benefits, overhead, workspace — industry standard multiplier)
  const hoursOfWorkLost = totalImpact / (salaryEquivalent * 2);

  const riskLevel =
    totalImpact > 500000
      ? "critical"
      : totalImpact > 100000
      ? "high"
      : totalImpact > 25000
      ? "medium"
      : "low";

  const riskColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-green-500",
  };

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Business impact formula:</div>
        <div className="text-blue-600 dark:text-blue-400">
          I = Σ (cost/hour × downtime) + recovery × 0.3
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Total damage = immediate cost + 30% of recovery cost (indirect impact) · Loaded cost = 2× salary (industry standard)
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-500" />
                <CardTitle className="text-base">Affected Systems</CardTitle>
              </div>
              <p className="text-sm text-slate-500">
                Which systems are affected by the key-person incident?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SYSTEMS.map((system) => (
                  <div
                    key={system.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      affectedSystems.has(system.id)
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          affectedSystems.has(system.id)
                            ? "bg-red-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {system.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{system.name}</div>
                        <div className="text-xs text-slate-500">
                          {formatCurrency(system.downtimeCostPerHour)}/h · recovery:{" "}
                          {system.recoveryTimeHours}h
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      checked={affectedSystems.has(system.id)}
                      onCheckedChange={() => toggleSystem(system.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scenario Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Hours offline</Label>
                  <span className="font-mono">{hoursOffline}h</span>
                </div>
                <Slider
                  value={[hoursOffline]}
                  onValueChange={([v]) => setHoursOffline(v)}
                  min={1}
                  max={168}
                  step={1}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1h</span>
                  <span>24h</span>
                  <span>72h</span>
                  <span>168h</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Key-person annual salary</Label>
                  <span className="font-mono">{formatCurrency(keyPersonSalary)}</span>
                </div>
                <Slider
                  value={[keyPersonSalary]}
                  onValueChange={([v]) => setKeyPersonSalary(v)}
                  min={50000}
                  max={500000}
                  step={10000}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Risk Level Card */}
          <Card className="overflow-hidden">
            <div className={`h-2 ${riskColors[riskLevel]}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-slate-500">Risk level</div>
                  <div className="text-2xl font-bold capitalize">
                    {riskLevel === "critical" && "Critical"}
                    {riskLevel === "high" && "High"}
                    {riskLevel === "medium" && "Medium"}
                    {riskLevel === "low" && "Low"}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-full ${riskColors[riskLevel]} flex items-center justify-center text-white`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Immediate damage</div>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(totalImmediateImpact)}
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Recovery cost</div>
                  <div className="text-xl font-bold text-amber-600">
                    {formatCurrency(totalRecoveryCost)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Impact */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-60" />
              <div className="text-sm opacity-60">Estimated total damage</div>
              <div className="text-4xl font-bold">{formatCurrency(totalImpact)}</div>
              <div className="text-sm opacity-60 mt-2">
                Equivalent to {hoursOfWorkLost.toFixed(0)}h of productive work time
              </div>
            </CardContent>
          </Card>

          {/* Impact Chart */}
          {affectedSystems.size > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Damage per system</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impactData.filter((d) => d.isAffected)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="immediateCost" name="Immediate" fill="#ef4444" />
                      <Bar dataKey="recoveryCost" name="Recovery" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recovery Timeline */}
          {affectedSystems.size > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <CardTitle className="text-base">Recovery timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {impactData
                    .filter((d) => d.isAffected)
                    .sort((a, b) => b.recoveryTime - a.recoveryTime)
                    .map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-20 text-xs">{item.name}</div>
                        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min((item.recoveryTime / 168) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="w-16 text-xs text-right">{item.recoveryTime}h</div>
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
