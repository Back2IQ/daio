// ── Asset Categories ──────────────────────────────────────────────

export type AssetCategoryId =
  | "crypto"
  | "nfts"
  | "gaming"
  | "social-media"
  | "domains"
  | "digital-business"
  | "cloud-identity"
  | "creative-ip"
  | "loyalty"
  | "communities"
  | "email-accounts"
  | "password-vaults";

export interface AssetCategory {
  id: AssetCategoryId;
  name: string;
  icon: string; // lucide icon name
  description: string;
  examples: string;
  /** Known global market estimate (if available) */
  globalEstimate?: string;
  /** Whether reliable loss data exists */
  hasReliableLossData: boolean;
}

// ── Inventory ────────────────────────────────────────────────────

export type AccessMethod =
  | "private-key"
  | "seed-phrase"
  | "password"
  | "2fa"
  | "hardware-wallet"
  | "biometric"
  | "oauth"
  | "api-key"
  | "unknown";

export type GovernanceStatus =
  | "undocumented"
  | "partially-documented"
  | "fully-documented"
  | "succession-ready";

export interface DigitalAsset {
  id: string;
  category: AssetCategoryId;
  name: string;
  platform?: string;
  estimatedValue?: number;
  currency: "EUR" | "USD";
  accessMethods: AccessMethod[];
  governanceStatus: GovernanceStatus;
  notes?: string;
  /** For social: follower count */
  followers?: number;
  /** For social: monthly revenue */
  monthlyRevenue?: number;
  /** For domains: expiry date */
  expiryDate?: string;
  createdAt: number;
}

export interface InventoryState {
  assets: DigitalAsset[];
  currency: "EUR" | "USD";
}

// ── Risk Assessment ──────────────────────────────────────────────

export type RiskLevel = "critical" | "high" | "medium" | "low" | "secured";

export interface RiskQuestion {
  id: string;
  category: AssetCategoryId;
  question: string;
  weight: number; // 1-5
}

export interface RiskAnswer {
  questionId: string;
  answer: boolean; // true = risk mitigated
}

export interface CategoryRisk {
  category: AssetCategoryId;
  riskLevel: RiskLevel;
  score: number; // 0-100 (0 = total risk, 100 = fully secured)
  answeredQuestions: number;
  totalQuestions: number;
  assetCount: number;
  totalValue: number;
}

export interface RiskAssessmentState {
  answers: RiskAnswer[];
  categoryRisks: CategoryRisk[];
  overallScore: number;
}

// ── Module ───────────────────────────────────────────────────────

export type TabId = "inventory" | "risk-assessment";
