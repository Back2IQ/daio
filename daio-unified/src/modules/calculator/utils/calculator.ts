// DAIO Value Explorer Calculator
// Implements the core formulas for risk and ROI calculations

import type { CalculatorInputs, CalculationResults, YearlyProjection } from "../types";

/**
 * Calculate expected prevented loss (current)
 * N = V * (p_u - p_d)
 */
export function calculateExpectedPreventedLoss(
  totalValue: number,
  riskWithoutDAIO: number,
  riskWithDAIO: number
): number {
  return totalValue * (riskWithoutDAIO / 100 - riskWithDAIO / 100);
}

/**
 * Calculate future value
 * V_t = V * (1 + g)^t
 */
export function calculateFutureValue(
  totalValue: number,
  growthRate: number,
  timeHorizon: number
): number {
  return totalValue * Math.pow(1 + growthRate / 100, timeHorizon);
}

/**
 * Calculate future prevented loss
 * N_t = V_t * (p_u - p_d)
 */
export function calculateFuturePreventedLoss(
  futureValue: number,
  riskWithoutDAIO: number,
  riskWithDAIO: number
): number {
  return futureValue * (riskWithoutDAIO / 100 - riskWithDAIO / 100);
}

/**
 * Calculate ROI
 * ROI = (N - C) / C
 */
export function calculateROI(
  expectedPreventedLoss: number,
  daioCost: number
): number {
  if (daioCost === 0) return Infinity;
  if (daioCost < 0) return -Infinity;
  return ((expectedPreventedLoss - daioCost) / daioCost) * 100;
}

/**
 * Calculate continuity score (0-100)
 * Based on custody type weighting and input completeness
 */
export function calculateContinuityScore(inputs: CalculatorInputs): number {
  let score = 20; // Start at baseline (lowered from 50 to prevent early saturation)

  const { allocation, riskWithDAIO, timeHorizon } = inputs;

  // Validate allocation values
  for (const [key, value] of Object.entries(allocation) as [string, number][]) {
    if (value < 0 || value > 100) {
      throw new Error(`Allocation for ${key} must be between 0 and 100`);
    }
  }

  // Self-custody weight (higher self-custody = more need for DAIO)
  const selfCustodyWeight = allocation.selfCustodyCrypto;
  score += selfCustodyWeight * 0.2;

  // DeFi weight (complex positions need more structure)
  const defiWeight = allocation.defiPositions;
  score += defiWeight * 0.15;

  // Business accounts weight
  const businessWeight = allocation.businessAccounts;
  score += businessWeight * 0.15;

  // Risk reduction (lower risk with DAIO = better)
  score += (15 - riskWithDAIO) * 1.5;

  // Time horizon (longer = more important)
  score += timeHorizon * 1;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get continuity score recommendation
 */
export function getContinuityRecommendation(score: number): string {
  if (score >= 80) {
    return "Excellent continuity planning. Your digital assets are well-structured for long-term preservation.";
  } else if (score >= 60) {
    return "Good foundation. Consider increasing governance structure for complex assets.";
  } else if (score >= 40) {
    return "Moderate risk. DAIO implementation can significantly improve your continuity posture.";
  } else {
    return "High risk profile. Immediate action recommended to protect your digital assets.";
  }
}

/**
 * Calculate year-by-year projections
 */
export function calculateYearlyProjections(
  inputs: CalculatorInputs
): YearlyProjection[] {
  // Validate inputs for yearly projections
  if (inputs.timeHorizon <= 0) throw new Error("Time horizon must be positive");
  
  const projections: YearlyProjection[] = [];
  const { totalValue, growthRate, riskWithoutDAIO, riskWithDAIO, daioCost } =
    inputs;

  let cumulativeBenefit = -daioCost; // Start with cost

  for (let year = 1; year <= inputs.timeHorizon; year++) {
    const portfolioValue = calculateFutureValue(
      totalValue,
      growthRate,
      year
    );
    const preventedLoss = calculateFuturePreventedLoss(
      portfolioValue,
      riskWithoutDAIO,
      riskWithDAIO
    );
    cumulativeBenefit += preventedLoss;

    projections.push({
      year,
      portfolioValue: Math.round(portfolioValue),
      preventedLoss: Math.round(preventedLoss),
      cumulativeBenefit: Math.round(cumulativeBenefit),
    });
  }

  return projections;
}

/**
 * Perform all calculations
 */
export function calculateAll(
  inputs: CalculatorInputs
): CalculationResults {
  // Validate inputs
  if (inputs.totalValue < 0) throw new Error("Total value cannot be negative");
  if (inputs.riskWithoutDAIO < 0 || inputs.riskWithoutDAIO > 100) throw new Error("Risk without DAIO must be between 0 and 100");
  if (inputs.riskWithDAIO < 0 || inputs.riskWithDAIO > 100) throw new Error("Risk with DAIO must be between 0 and 100");
  if (inputs.riskWithDAIO > inputs.riskWithoutDAIO) throw new Error("Risk with DAIO cannot be higher than risk without DAIO");
  if (inputs.timeHorizon <= 0) throw new Error("Time horizon must be positive");
  if (inputs.daioCost < 0) throw new Error("DAIO cost cannot be negative");

  const expectedPreventedLoss = calculateExpectedPreventedLoss(
    inputs.totalValue,
    inputs.riskWithoutDAIO,
    inputs.riskWithDAIO
  );

  const futureValue = calculateFutureValue(
    inputs.totalValue,
    inputs.growthRate,
    inputs.timeHorizon
  );

  const futurePreventedLoss = calculateFuturePreventedLoss(
    futureValue,
    inputs.riskWithoutDAIO,
    inputs.riskWithDAIO
  );

  const roi = calculateROI(expectedPreventedLoss, inputs.daioCost);

  const continuityScore = calculateContinuityScore(inputs);

  const yearlyProjections = calculateYearlyProjections(inputs);

  return {
    expectedPreventedLoss: Math.round(expectedPreventedLoss),
    futureValue: Math.round(futureValue),
    futurePreventedLoss: Math.round(futurePreventedLoss),
    roi: Math.round(roi * 10) / 10, // Round to 1 decimal
    continuityScore,
    yearlyProjections,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: CalculatorInputs["currency"]
): string {
  const symbols: Record<CalculatorInputs["currency"], string> = {
    EUR: "€",
    USD: "$",
    CHF: "CHF",
    GBP: "£",
  };

  const symbol = symbols[currency];

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}k`;
  } else {
    return `${symbol}${value}`;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  if (value === Infinity) return "+∞%";
  if (value === -Infinity) return "-∞%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
