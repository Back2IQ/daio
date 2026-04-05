// DAIO Strategic Platform - Shared Types

// ============================================
// Common Asset Types
// ============================================

export type AssetCategory =
  | "crypto"
  | "nft"
  | "defi"
  | "rwa"
  | "business"
  | "domain"
  | "gaming"
  | "social"
  | "cloud"
  | "wallet";

export type CustodyType = "self" | "exchange" | "institutional" | "hybrid";

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  value: number;
  custody: CustodyType;
  recoverableWithoutDaio: boolean;
  recoveryTimeDays: number;
  recoveryCostPercent: number;
}

// ============================================
// Loss Simulator Types
// ============================================

export interface LossScenario {
  day: number;
  label: string;
  withoutDaio: {
    recoverableValue: number;
    frozenValue: number;
    lostValue: number;
  };
  withDaio: {
    recoverableValue: number;
    frozenValue: number;
    lostValue: number;
  };
}

export interface PortfolioInput {
  totalValue: number;
  cryptoPercent: number;
  defiPercent: number;
  exchangePercent: number;
  custodyType: CustodyType;
  hasDocumentation: boolean;
  hasExecutor: boolean;
}

// ============================================
// Invisible Wealth Types
// ============================================

export interface WealthCategory {
  id: string;
  name: string;
  icon: string;
  typicalValue: number;
  commonlyMissed: boolean;
  recoveryDifficulty: "easy" | "medium" | "hard" | "impossible";
}

export interface WealthScanResult {
  category: WealthCategory;
  userHasIt: boolean;
  userDocumented: boolean;
}

// ============================================
// Key Person Risk Types
// ============================================

export interface BusinessSystem {
  id: string;
  name: string;
  category: "infrastructure" | "financial" | "code" | "operations" | "communication";
  downtimeCostPerHour: number;
  recoveryTimeHours: number;
  accessMethod: string;
  backupPossible: boolean;
}

export interface RiskScenario {
  hoursOffline: number;
  systemsAffected: string[];
  totalCost: number;
}

// ============================================
// Stress Test Types
// ============================================

export type StressEvent = "death" | "incapacity" | "divorce" | "relocation" | "trustee-failure";

export interface StressTestResult {
  event: StressEvent;
  assetsBlocked: number;
  assetsAtRisk: number;
  recoveryTimeMonths: number;
  legalCostEstimate: number;
}

// ============================================
// Governance Flow Types
// ============================================

export interface FlowStep {
  id: string;
  type: "asset" | "trigger" | "executor" | "quorum" | "release" | "beneficiary";
  label: string;
  description: string;
  requirements: string[];
}

export interface GovernancePath {
  id: string;
  name: string;
  steps: FlowStep[];
}

// ============================================
// Continuity Index Types
// ============================================

export interface GovernanceComponent {
  id: string;
  name: string;
  category: "roles" | "triggers" | "policies" | "documentation";
  weight: number;
  implemented: boolean;
}

export interface ContinuityScore {
  total: number;
  breakdown: Record<string, number>;
  recommendations: string[];
}

// ============================================
// Constants
// ============================================

export const ASSET_CATEGORY_NAMES: Record<AssetCategory, string> = {
  crypto: "Cryptocurrency",
  nft: "NFTs & Collectibles",
  defi: "DeFi Positions",
  rwa: "Tokenized RWA",
  business: "Business Accounts",
  domain: "Domains & DNS",
  gaming: "Gaming Assets",
  social: "Social Media",
  cloud: "Cloud Services",
  wallet: "Digital Wallets",
};

export const CUSTODY_TYPE_NAMES: Record<CustodyType, string> = {
  self: "Self-Custody",
  exchange: "Exchange",
  institutional: "Institutional",
  hybrid: "Hybrid/Multi-sig",
};

export const STRESS_EVENT_NAMES: Record<StressEvent, string> = {
  death: "Tod",
  incapacity: "Inkapazität",
  divorce: "Scheidung",
  relocation: "Umzug ins Ausland",
  "trustee-failure": "Treuhänder-Ausfall",
};
