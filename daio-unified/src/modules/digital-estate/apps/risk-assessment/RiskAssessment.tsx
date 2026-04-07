import { useMemo } from "react";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DigitalAsset, RiskAnswer } from "../../types";
import { ASSET_CATEGORIES, RISK_QUESTIONS } from "../../utils/categories";
import {
  computeCategoryRisk,
  computeOverallScore,
  RISK_COLORS,
  RISK_LABELS,
} from "../../utils/scoring";
import { ICON_MAP } from "../../utils/icons";

interface Props {
  assets: DigitalAsset[];
  answers: RiskAnswer[];
  currency: "EUR" | "USD";
  onAnswersChange: (answers: RiskAnswer[]) => void;
}

export default function RiskAssessment({ assets, answers, currency, onAnswersChange }: Props) {
  const symbol = currency === "EUR" ? "\u20AC" : "$";

  // Only show categories that have assets OR have answers
  const activeCategories = useMemo(() => {
    const withAssets = new Set(assets.map((a) => a.category));
    const withAnswers = new Set(
      answers.map((a) => RISK_QUESTIONS.find((q) => q.id === a.questionId)?.category).filter(Boolean)
    );
    return ASSET_CATEGORIES.filter(
      (c) => withAssets.has(c.id) || withAnswers.has(c.id)
    );
  }, [assets, answers]);

  const categoryRisks = useMemo(
    () => ASSET_CATEGORIES.map((c) => computeCategoryRisk(c.id, answers, assets)),
    [answers, assets]
  );

  const overallScore = useMemo(
    () => computeOverallScore(categoryRisks),
    [categoryRisks]
  );

  const activeCategoryRisks = useMemo(
    () => categoryRisks.filter((cr) => activeCategories.some((c) => c.id === cr.category)),
    [categoryRisks, activeCategories]
  );

  function toggleAnswer(questionId: string, value: boolean) {
    const existing = answers.findIndex((a) => a.questionId === questionId);
    if (existing >= 0) {
      const updated = [...answers];
      if (updated[existing].answer === value) {
        // Toggle off
        updated.splice(existing, 1);
      } else {
        updated[existing] = { questionId, answer: value };
      }
      onAnswersChange(updated);
    } else {
      onAnswersChange([...answers, { questionId, answer: value }]);
    }
  }

  const totalAnswered = answers.length;
  const totalQuestions = RISK_QUESTIONS.filter((q) =>
    activeCategories.some((c) => c.id === q.category)
  ).length;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score circle */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                  strokeDasharray={`${overallScore * 2.64} ${264 - overallScore * 2.64}`}
                  strokeLinecap="round"
                  className={overallScore >= 70 ? "text-emerald-500" : overallScore >= 40 ? "text-amber-500" : "text-red-500"}
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{overallScore}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">
                {overallScore >= 70
                  ? "Good Governance Posture"
                  : overallScore >= 40
                    ? "Significant Gaps Detected"
                    : assets.length === 0
                      ? "Add Assets to Begin Assessment"
                      : "Critical Risk Exposure"}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {assets.length > 0
                  ? `${totalAnswered} of ${totalQuestions} questions answered across ${activeCategories.length} categories`
                  : "Add assets in the Inventory tab to unlock your risk assessment"}
              </p>
              {assets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeCategoryRisks.map((cr) => (
                    <Badge
                      key={cr.category}
                      variant="outline"
                      className={RISK_COLORS[cr.riskLevel]}
                    >
                      {ASSET_CATEGORIES.find((c) => c.id === cr.category)?.name}: {RISK_LABELS[cr.riskLevel]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap grid */}
      {activeCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {activeCategoryRisks.map((cr) => {
            const cat = ASSET_CATEGORIES.find((c) => c.id === cr.category)!;
            return (
              <div
                key={cr.category}
                className={`rounded-lg p-3 border ${
                  cr.riskLevel === "critical" ? "bg-red-500/10 border-red-500/30" :
                  cr.riskLevel === "high" ? "bg-orange-500/10 border-orange-500/30" :
                  cr.riskLevel === "medium" ? "bg-amber-500/10 border-amber-500/30" :
                  cr.riskLevel === "low" ? "bg-emerald-400/10 border-emerald-400/30" :
                  "bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-muted-foreground">{ICON_MAP[cat.icon]}</div>
                  <span className="text-xs font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${RISK_COLORS[cr.riskLevel]}`}>{cr.score}%</span>
                  <span className="text-[10px] text-muted-foreground">{cr.assetCount} assets</span>
                </div>
                <Progress value={cr.score} className="h-1.5 mt-1" />
              </div>
            );
          })}
        </div>
      )}

      {/* Questions by category */}
      {activeCategories.map((cat) => {
        const questions = RISK_QUESTIONS.filter((q) => q.category === cat.id);
        if (questions.length === 0) return null;
        const cr = categoryRisks.find((c) => c.category === cat.id)!;

        return (
          <Card key={cat.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {ICON_MAP[cat.icon]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cr.answeredQuestions}/{cr.totalQuestions} answered
                      {cr.assetCount > 0 && ` \u00B7 ${cr.assetCount} assets \u00B7 ${symbol}${cr.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={RISK_COLORS[cr.riskLevel]}>
                  {RISK_LABELS[cr.riskLevel]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {questions.map((q) => {
                const answer = answers.find((a) => a.questionId === q.id);
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-accent/20"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{q.question}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: q.weight }).map((_, i) => (
                          <AlertTriangle key={i} className="w-3 h-3 text-amber-500/60" />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          Weight: {q.weight}/5
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant={answer?.answer === true ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${answer?.answer === true ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        onClick={() => toggleAnswer(q.id, true)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={answer?.answer === false ? "destructive" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleAnswer(q.id, false)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {activeCategories.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Assets to Assess</h3>
            <p className="text-sm text-muted-foreground">
              Switch to the <strong>Inventory</strong> tab and add your digital assets first.
              The risk assessment will adapt to your portfolio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
