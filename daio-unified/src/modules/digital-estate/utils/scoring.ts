import type {
  AssetCategoryId,
  CategoryRisk,
  DigitalAsset,
  RiskAnswer,
  RiskLevel,
} from "../types";
import { RISK_QUESTIONS } from "./categories";

export function computeCategoryRisk(
  category: AssetCategoryId,
  answers: RiskAnswer[],
  assets: DigitalAsset[]
): CategoryRisk {
  const questions = RISK_QUESTIONS.filter((q) => q.category === category);
  const categoryAssets = assets.filter((a) => a.category === category);

  if (questions.length === 0) {
    return {
      category,
      riskLevel: "low",
      score: 100,
      answeredQuestions: 0,
      totalQuestions: 0,
      assetCount: categoryAssets.length,
      totalValue: categoryAssets.reduce((s, a) => s + (a.estimatedValue ?? 0), 0),
    };
  }

  let totalWeight = 0;
  let securedWeight = 0;
  let answered = 0;

  for (const q of questions) {
    totalWeight += q.weight;
    const a = answers.find((a) => a.questionId === q.id);
    if (a) {
      answered++;
      if (a.answer) securedWeight += q.weight;
    }
  }

  const score = totalWeight > 0 ? Math.round((securedWeight / totalWeight) * 100) : 0;

  return {
    category,
    riskLevel: scoreToRiskLevel(score),
    score,
    answeredQuestions: answered,
    totalQuestions: questions.length,
    assetCount: categoryAssets.length,
    totalValue: categoryAssets.reduce((s, a) => s + (a.estimatedValue ?? 0), 0),
  };
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 90) return "secured";
  if (score >= 70) return "low";
  if (score >= 45) return "medium";
  if (score >= 20) return "high";
  return "critical";
}

export function computeOverallScore(categoryRisks: CategoryRisk[]): number {
  const withAssets = categoryRisks.filter((c) => c.assetCount > 0);
  if (withAssets.length === 0) return 0;

  // Weight by total value if available, else equal weight
  const totalValue = withAssets.reduce((s, c) => s + c.totalValue, 0);

  if (totalValue > 0) {
    const weighted = withAssets.reduce(
      (s, c) => s + c.score * (c.totalValue / totalValue),
      0
    );
    return Math.round(weighted);
  }

  return Math.round(
    withAssets.reduce((s, c) => s + c.score, 0) / withAssets.length
  );
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: "text-red-500",
  high: "text-orange-500",
  medium: "text-amber-500",
  low: "text-emerald-400",
  secured: "text-emerald-500",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
  secured: "Secured",
};
