// DAIO Value Explorer Types

export interface PortfolioAllocation {
  selfCustodyCrypto: number; // 0-100%
  tokenizedRWA: number; // 0-100%
  defiPositions: number; // 0-100%
  nfts: number; // 0-100%
  businessAccounts: number; // 0-100%
  other: number; // 0-100%
}

export interface CalculatorInputs {
  totalValue: number;
  allocation: PortfolioAllocation;
  riskWithoutDAIO: number; // 1-30%
  riskWithDAIO: number; // 0-15%
  timeHorizon: number; // 1-20 years
  growthRate: number; // 0-10%
  daioCost: number;
  currency: "EUR" | "USD" | "CHF" | "GBP";
}

export interface CalculationResults {
  // Expected prevented loss (current)
  expectedPreventedLoss: number;

  // Future value
  futureValue: number;

  // Future prevented loss
  futurePreventedLoss: number;

  // ROI
  roi: number;

  // Continuity score (0-100)
  continuityScore: number;

  // Year-by-year projections
  yearlyProjections: YearlyProjection[];
}

export interface YearlyProjection {
  year: number;
  portfolioValue: number;
  preventedLoss: number;
  cumulativeBenefit: number;
}

export interface Scenario {
  name: string;
  description: string;
  inputs: Partial<CalculatorInputs>;
}

// Preset scenarios
export const PRESET_SCENARIOS: Scenario[] = [
  {
    name: "Crypto-Heavy Portfolio",
    description: "High allocation to self-custody crypto assets",
    inputs: {
      allocation: {
        selfCustodyCrypto: 60,
        tokenizedRWA: 10,
        defiPositions: 15,
        nfts: 5,
        businessAccounts: 5,
        other: 5,
      },
      riskWithoutDAIO: 18,  // Increased to reflect higher risk with high crypto allocation
      riskWithDAIO: 5,      // Adjusted to maintain reasonable risk reduction
      growthRate: 8,
    },
  },
  {
    name: "RWA Hybrid",
    description: "Balanced mix of crypto and tokenized real-world assets",
    inputs: {
      allocation: {
        selfCustodyCrypto: 30,
        tokenizedRWA: 40,
        defiPositions: 10,
        nfts: 5,
        businessAccounts: 10,
        other: 5,
      },
      riskWithoutDAIO: 12,  // Increased slightly for more realistic baseline
      riskWithDAIO: 4,      // Adjusted proportionally
      growthRate: 6,
    },
  },
  {
    name: "Entrepreneur Assets",
    description: "Business accounts and digital property focus",
    inputs: {
      allocation: {
        selfCustodyCrypto: 20,
        tokenizedRWA: 15,
        defiPositions: 5,
        nfts: 5,
        businessAccounts: 45,
        other: 10,
      },
      riskWithoutDAIO: 22,  // Increased for more realistic risk assessment
      riskWithDAIO: 6,      // Adjusted to maintain proportional risk reduction
      growthRate: 7,
    },
  },
  {
    name: "DeFi Risk Profile",
    description: "High DeFi exposure with complex positions",
    inputs: {
      allocation: {
        selfCustodyCrypto: 25,
        tokenizedRWA: 10,
        defiPositions: 45,
        nfts: 10,
        businessAccounts: 5,
        other: 5,
      },
      riskWithoutDAIO: 28,  // Increased to reflect high risk nature of complex DeFi
      riskWithDAIO: 7,      // Adjusted to show continued risk reduction
      growthRate: 10,
    },
  },
];

// Asset category labels
export const ALLOCATION_LABELS: Record<keyof PortfolioAllocation, string> = {
  selfCustodyCrypto: "Self-Custody Crypto",
  tokenizedRWA: "Tokenized RWA",
  defiPositions: "DeFi Positions",
  nfts: "NFTs / Collectibles",
  businessAccounts: "Business Accounts",
  other: "Other Assets",
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<CalculatorInputs["currency"], string> = {
  EUR: "€",
  USD: "$",
  CHF: "CHF",
  GBP: "£",
};
