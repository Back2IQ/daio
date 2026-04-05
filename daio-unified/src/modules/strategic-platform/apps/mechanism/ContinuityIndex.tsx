import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface GovernanceComponent {
  id: string;
  name: string;
  category: "roles" | "triggers" | "policies" | "documentation";
  weight: number;
  implemented: boolean;
  maturity: number; // 0-1
}

const DEFAULT_COMPONENTS: GovernanceComponent[] = [
  // Roles
  { id: "owner", name: "Owner identified", category: "roles", weight: 10, implemented: true, maturity: 1 },
  { id: "executor", name: "Will executor", category: "roles", weight: 15, implemented: false, maturity: 0 },
  { id: "guardians", name: "Guardians (Multi-sig)", category: "roles", weight: 12, implemented: false, maturity: 0 },
  { id: "beneficiaries", name: "Beneficiaries defined", category: "roles", weight: 10, implemented: false, maturity: 0 },

  // Triggers
  { id: "death_trigger", name: "Death trigger", category: "triggers", weight: 15, implemented: false, maturity: 0 },
  { id: "incapacity_trigger", name: "Incapacity trigger", category: "triggers", weight: 10, implemented: false, maturity: 0 },
  { id: "time_trigger", name: "Time-based trigger", category: "triggers", weight: 8, implemented: false, maturity: 0 },

  // Policies
  { id: "quorum", name: "Quorum rule (M-of-N)", category: "policies", weight: 12, implemented: false, maturity: 0 },
  { id: "timelock", name: "Time-lock policy", category: "policies", weight: 10, implemented: false, maturity: 0 },
  { id: "dispute", name: "Objection mechanism", category: "policies", weight: 8, implemented: false, maturity: 0 },

  // Documentation
  { id: "asset_registry", name: "Asset registry", category: "documentation", weight: 10, implemented: false, maturity: 0 },
  { id: "access_docs", name: "Access documentation", category: "documentation", weight: 15, implemented: false, maturity: 0 },
  { id: "legal_docs", name: "Legal documents", category: "documentation", weight: 10, implemented: false, maturity: 0 },
];

export function ContinuityIndex() {
  const [components, setComponents] = useState<GovernanceComponent[]>(DEFAULT_COMPONENTS);

  const toggleComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, implemented: !c.implemented, maturity: c.implemented ? 0 : 0.5 }
          : c
      )
    );
  };

  const updateMaturity = (id: string, maturity: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, maturity: maturity / 100 } : c))
    );
  };

  const scores = useMemo(() => {
    const categories = ["roles", "triggers", "policies", "documentation"] as const;

    const categoryScores = categories.map((cat) => {
      const catComponents = components.filter((c) => c.category === cat);
      const maxScore = catComponents.reduce((sum, c) => sum + c.weight, 0);
      const actualScore = catComponents.reduce(
        (sum, c) => sum + c.weight * (c.implemented ? 1 : 0) * c.maturity,
        0
      );
      return {
        category: cat,
        score: maxScore > 0 ? (actualScore / maxScore) * 100 : 0,
        maxScore,
        actualScore,
      };
    });

    const totalMax = components.reduce((sum, c) => sum + c.weight, 0);
    const totalActual = components.reduce(
      (sum, c) => sum + c.weight * (c.implemented ? 1 : 0) * c.maturity,
      0
    );
    const totalScore = totalMax > 0 ? (totalActual / totalMax) * 100 : 0;

    return { categoryScores, totalScore };
  }, [components]);

  const getRecommendations = () => {
    const recommendations: string[] = [];

    if (!components.find((c) => c.id === "executor")?.implemented) {
      recommendations.push("Nominate a will executor");
    }
    if (!components.find((c) => c.id === "access_docs")?.implemented) {
      recommendations.push("Document access credentials");
    }
    if (!components.find((c) => c.id === "quorum")?.implemented) {
      recommendations.push("Define quorum rule");
    }
    if (!components.find((c) => c.id === "death_trigger")?.implemented) {
      recommendations.push("Set up death trigger");
    }

    return recommendations;
  };

  const radarData = scores.categoryScores.map((s) => ({
    subject: s.category.charAt(0).toUpperCase() + s.category.slice(1),
    A: s.score,
    fullMark: 100,
  }));

  const barData = scores.categoryScores.map((s) => ({
    name: s.category.charAt(0).toUpperCase() + s.category.slice(1),
    score: Math.round(s.score),
  }));

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 60) return { label: "Good", color: "bg-blue-500" };
    if (score >= 40) return { label: "Needs improvement", color: "bg-amber-500" };
    return { label: "Critical", color: "bg-red-500" };
  };

  const scoreLevel = getScoreLevel(scores.totalScore);

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Continuity Index formula:</div>
        <div className="text-blue-600 dark:text-blue-400">
          CI = Σ (weight × implementation × maturity) / Σ(weight) × 100
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Calculates governance maturity across all categories
        </div>
      </div>

      {/* Score Header */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${scoreLevel.color}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full ${scoreLevel.color} flex items-center justify-center text-white`}>
                <div className="text-center">
                  <div className="text-2xl font-bold">{scores.totalScore.toFixed(0)}</div>
                  <div className="text-xs">/ 100</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Continuity Index</div>
                <div className="text-xl font-bold">{scoreLevel.label}</div>
                <div className="text-sm text-slate-500">
                  {components.filter((c) => c.implemented).length} of {components.length} components
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Target score</div>
              <div className="text-2xl font-bold text-green-600">80+</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Component Builder */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base">Governance components</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["roles", "triggers", "policies", "documentation"].map((category) => (
                  <div key={category}>
                    <div className="text-sm font-medium text-slate-500 mb-2 capitalize">
                      {category === "roles" && "Roles"}
                      {category === "triggers" && "Triggers"}
                      {category === "policies" && "Policies"}
                      {category === "documentation" && "Documentation"}
                    </div>
                    <div className="space-y-2">
                      {components
                        .filter((c) => c.category === category)
                        .map((component) => (
                          <div
                            key={component.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              component.implemented
                                ? "bg-green-50 border border-green-200"
                                : "bg-slate-50 border border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={component.implemented}
                                onCheckedChange={() => toggleComponent(component.id)}
                              />
                              <Label className="text-sm cursor-pointer">
                                {component.name}
                              </Label>
                            </div>
                            {component.implemented && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Maturity:</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={component.maturity * 100}
                                  onChange={(e) =>
                                    updateMaturity(component.id, parseInt(e.target.value))
                                  }
                                  className="w-20"
                                />
                                <span className="text-xs w-8">
                                  {Math.round(component.maturity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {scores.totalScore < 80 && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <CardTitle className="text-base text-amber-800">
                    Recommended next steps
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getRecommendations().map((rec, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-800">
                      <TrendingUp className="w-4 h-4" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visualizations */}
        <div className="space-y-4">
          {/* Radar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Scores per category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scores.categoryScores.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">
                        {cat.category === "roles" && "Roles"}
                        {cat.category === "triggers" && "Triggers"}
                        {cat.category === "policies" && "Policies"}
                        {cat.category === "documentation" && "Documentation"}
                      </span>
                      <span className="font-mono">{cat.score.toFixed(0)}%</span>
                    </div>
                    <Progress value={cat.score} className="h-2" />
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
