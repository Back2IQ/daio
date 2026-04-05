// Mathematical calculations for DAIO Strategic Platform

import type { LossScenario, PortfolioInput, StressEvent } from "../types";

/**
 * Calculate exponential decay for asset recovery
 * V(t) = V0 * e^(-λt)
 * where λ is the decay rate based on custody type
 */
export function calculateDecay(
  initialValue: number,
  days: number,
  custodyType: string
): number {
  // Illustrative decay rates modeling accessibility loss over time
  // Self-custody: steepest decay (no recovery path without keys)
  // Exchange: moderate (account recovery possible but slow)
  // Institutional: slowest (legal processes enable recovery)
  // These are modeled estimates — not empirically validated constants
  const decayRates: Record<string, number> = {
    self: 0.015, // 1.5%/day — ~36% remaining after 30d, ~1% after 180d
    exchange: 0.005, // 0.5%/day — ~86% remaining after 30d, ~41% after 180d
    institutional: 0.002, // 0.2%/day — ~94% remaining after 30d, ~70% after 180d
    hybrid: 0.008, // 0.8%/day — ~79% remaining after 30d, ~24% after 180d
  };

  const lambda = decayRates[custodyType] || 0.01;
  return initialValue * Math.exp(-lambda * days);
}

/**
 * Calculate liquidation probability over time
 * P(liquid) = 1 - e^(-t/τ)
 * where τ is the characteristic time
 */
export function calculateLiquidationProbability(
  days: number,
  custodyType: string
): number {
  const timeConstants: Record<string, number> = {
    self: 30, // 30 days characteristic time
    exchange: 90,
    institutional: 180,
    hybrid: 60,
  };

  const tau = timeConstants[custodyType] || 60;
  return 1 - Math.exp(-days / tau);
}

/**
 * Calculate DeFi position decay
 * Accounts for impermanent loss, liquidation, and protocol risks
 */
export function calculateDeFiDecay(
  initialValue: number,
  days: number,
  hasDocumentation: boolean
): { value: number; status: "healthy" | "at-risk" | "liquidated" } {
  // 2%/day base decay — models impermanent loss + liquidation risk for unmanaged DeFi positions
  const baseDecay = 0.02;
  // Documentation halves decay rate (positions can be managed/unwound by informed executor)
  const docMultiplier = hasDocumentation ? 0.5 : 1.0;

  const effectiveDecay = baseDecay * docMultiplier;
  const remainingValue = initialValue * Math.exp(-effectiveDecay * days);

  const liquidationThreshold = initialValue * 0.5;
  const atRiskThreshold = initialValue * 0.8;

  let status: "healthy" | "at-risk" | "liquidated";
  if (remainingValue < liquidationThreshold) {
    status = "liquidated";
  } else if (remainingValue < atRiskThreshold) {
    status = "at-risk";
  } else {
    status = "healthy";
  }

  return { value: remainingValue, status };
}

/**
 * Calculate account blockade probability
 */
export function calculateBlockadeProbability(
  days: number,
  hasExecutor: boolean
): number {
  const baseProb = 0.3; // 30% base probability
  const executorReduction = hasExecutor ? 0.7 : 0; // 70% reduction with executor

  const dailyIncrease = 0.005; // 0.5% increase per day
  const probability = Math.min(
    baseProb * (1 - executorReduction) + dailyIncrease * days,
    0.95
  );

  return probability;
}

/**
 * Calculate total portfolio erosion over time
 */
export function calculatePortfolioErosion(
  portfolio: PortfolioInput,
  days: number
): {
  recoverable: number;
  frozen: number;
  lost: number;
} {
  const totalValue = portfolio.totalValue;

  // Calculate component values
  const cryptoValue = totalValue * (portfolio.cryptoPercent / 100);
  const defiValue = totalValue * (portfolio.defiPercent / 100);
  const exchangeValue = totalValue * (portfolio.exchangePercent / 100);
  const otherValue = totalValue * (1 - (portfolio.cryptoPercent + portfolio.defiPercent + portfolio.exchangePercent) / 100);

  // Crypto decay (self-custody)
  const cryptoDecay = calculateDecay(cryptoValue, days, "self");
  const cryptoLost = cryptoValue - cryptoDecay;

  // DeFi decay
  const defiResult = calculateDeFiDecay(defiValue, days, portfolio.hasDocumentation);
  const defiLost = defiValue - defiResult.value;

  // Exchange decay
  const exchangeDecay = calculateDecay(exchangeValue, days, "exchange");
  const exchangeFrozen = exchangeValue - exchangeDecay;

  // Other (assume institutional custody)
  const otherDecay = calculateDecay(otherValue, days, "institutional");

  const totalRecoverable = cryptoDecay + defiResult.value + exchangeDecay + otherDecay;
  const totalFrozen = exchangeFrozen;
  const totalLost = cryptoLost + defiLost;

  return {
    recoverable: Math.round(totalRecoverable),
    frozen: Math.round(totalFrozen),
    lost: Math.round(totalLost),
  };
}

/**
 * Calculate key person business impact
 * I = Σ (downtime_cost_i × recovery_time_i × systems_affected)
 */
export function calculateBusinessImpact(
  systems: { downtimeCostPerHour: number; recoveryTimeHours: number; affected: boolean }[]
): number {
  return systems.reduce((total, system) => {
    if (!system.affected) return total;
    return total + system.downtimeCostPerHour * system.recoveryTimeHours;
  }, 0);
}

/**
 * Calculate stress test score
 * Score = Σ (asset_value × risk_weight × event_multiplier)
 */
export function calculateStressTestScore(
  assetValues: Record<string, number>,
  event: StressEvent
): number {
  const eventMultipliers: Record<StressEvent, Record<string, number>> = {
    death: {
      crypto: 0.8,
      defi: 0.9,
      exchange: 0.4,
      business: 0.6,
      domain: 0.5,
    },
    incapacity: {
      crypto: 0.7,
      defi: 0.85,
      exchange: 0.5,
      business: 0.7,
      domain: 0.6,
    },
    divorce: {
      crypto: 0.5,
      defi: 0.6,
      exchange: 0.3,
      business: 0.8,
      domain: 0.4,
    },
    relocation: {
      crypto: 0.3,
      defi: 0.4,
      exchange: 0.2,
      business: 0.5,
      domain: 0.7,
    },
    "trustee-failure": {
      crypto: 0.9,
      defi: 0.95,
      exchange: 0.6,
      business: 0.7,
      domain: 0.8,
    },
  };

  const multipliers = eventMultipliers[event];
  let totalScore = 0;

  for (const [category, value] of Object.entries(assetValues)) {
    const multiplier = multipliers[category] || 0.5;
    totalScore += value * multiplier;
  }

  return totalScore;
}

/**
 * Calculate continuity index
 * CI = Σ (component_weight × implementation_status × maturity_factor)
 */
export function calculateContinuityIndex(
  components: { weight: number; implemented: boolean; maturity: number }[]
): number {
  const maxScore = components.reduce((sum, c) => sum + c.weight, 0);

  const actualScore = components.reduce((sum, c) => {
    const implementationValue = c.implemented ? 1 : 0;
    return sum + c.weight * implementationValue * c.maturity;
  }, 0);

  return Math.round((actualScore / maxScore) * 100);
}

/**
 * Calculate governance coverage
 * Coverage = (implemented_components / total_components) × 100
 */
export function calculateGovernanceCoverage(
  implemented: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((implemented / total) * 100);
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency: string = "EUR"): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    CHF: "CHF",
    GBP: "£",
    BTC: "₿",
  };

  const symbol = symbols[currency] || currency;

  if (value >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(0)}k`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Generate loss scenarios for timeline
 */
export function generateLossScenarios(portfolio: PortfolioInput): LossScenario[] {
  const days = [0, 7, 14, 30, 60, 90, 180];

  return days.map((day) => {
    const erosion = calculatePortfolioErosion(portfolio, day);

    return {
      day,
      label: day === 0 ? "Tag 0" : `Tag ${day}`,
      withoutDaio: {
        recoverableValue: erosion.recoverable,
        frozenValue: erosion.frozen,
        lostValue: erosion.lost,
      },
      withDaio: {
        recoverableValue: portfolio.totalValue * 0.98,
        frozenValue: portfolio.totalValue * 0.02,
        lostValue: 0,
      },
    };
  });
}
