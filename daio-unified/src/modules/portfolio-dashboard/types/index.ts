// DAIO Platform - Shared Types

// ============================================
// Common Types
// ============================================

export type AssetCategory =
  | "crypto"
  | "nft"
  | "defi"
  | "rwa"
  | "business"
  | "domain"
  | "other";

export type RoleType = "owner" | "executor" | "beneficiary" | "witness" | "advisor";

export type TriggerType = "death" | "incapacity" | "keyPerson" | "custom";

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  value: number;
  custody: "self" | "exchange" | "institutional" | "hybrid";
}

export interface Role {
  id: string;
  type: RoleType;
  name: string;
  contact?: string;
}

export interface Policy {
  id: string;
  name: string;
  quorum: number;
  timeDelay?: number;
  assets: string[];
  executors: string[];
  beneficiaries: string[];
}

// ============================================
// App 1: Incident Simulator Types
// ============================================

export interface IncidentScenario {
  id: string;
  name: string;
  description: string;
  triggerType: TriggerType;
  portfolioTypes: PortfolioType[];
}

export type PortfolioType = "crypto-heavy" | "entrepreneur" | "rwa" | "defi" | "balanced";

export interface SimulationStep {
  id: string;
  phase: "discovery" | "verification" | "execution" | "transfer";
  title: string;
  description: string;
  withoutDaio: {
    status: "fail" | "delay" | "chaos" | "success";
    details: string;
    timeCost: string;
    financialCost: string;
  };
  withDaio: {
    status: "success" | "smooth";
    details: string;
    timeCost: string;
    financialCost: string;
  };
}

export interface SimulationResult {
  totalTimeWithout: string;
  totalTimeWith: string;
  totalCostWithout: string;
  totalCostWith: string;
  conflictPotential: "high" | "medium" | "low";
  auditTrail: boolean;
}

// ============================================
// App 2: Governance Map Builder Types
// ============================================

export interface MapNode {
  id: string;
  type: "asset" | "role" | "trigger" | "policy" | "gate";
  label: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface GovernanceMap {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface GovernanceAnalysis {
  coverage: number;
  warnings: GovernanceWarning[];
  score: number;
}

export interface GovernanceWarning {
  type: "single-point-of-failure" | "no-quorum" | "no-time-delay" | "orphaned-asset" | "unassigned-role";
  message: string;
  nodeId?: string;
}

// ============================================
// App 3: Compliance Navigator Types
// ============================================

export type UserType = "family-office" | "bank" | "lawyer" | "advisor" | "individual";

export interface ComplianceQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    riskLevel: "low" | "medium" | "high";
  }[];
}

export interface CompliancePath {
  id: string;
  userType: UserType;
  questions: ComplianceQuestion[];
}

export interface RiskAssessment {
  operational: number;
  reputational: number;
  compliance: number;
  overall: number;
}

export interface DaioPositioning {
  whatWeDontDo: string[];
  whatWeDo: string[];
  documents: string[];
}

// ============================================
// App 4: Legacy Proof Lab Types
// ============================================

export interface ProofCase {
  id: string;
  name: string;
  assets: ProofAsset[];
  roles: ProofRole[];
  checklists: ChecklistItem[];
}

export interface ProofAsset {
  id: string;
  category: AssetCategory;
  hint: string;
  value: number;
}

export interface ProofRole {
  id: string;
  type: RoleType;
  name: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  verifiedBy?: string;
  timestamp?: string;
}

export interface HashEntry {
  id: string;
  data: string;
  hash: string;
  previousHash: string;
  timestamp: string;
}

export interface EvidenceTrail {
  entries: HashEntry[];
  rootHash: string;
}

// ============================================
// App 5: Continuity Dashboard Types
// ============================================

export interface PortfolioInput {
  totalValue: number;
  currency: "EUR" | "USD" | "CHF" | "GBP";
  allocation: Record<AssetCategory, number>;
}

export interface OrganizationStatus {
  hasExecutor: boolean;
  hasBeneficiary: boolean;
  hasQuorum: boolean;
  hasTimeDelay: boolean;
  hasDocumentation: boolean;
}

export interface ContinuityMetrics {
  score: number;
  maturityLevel: "ad-hoc" | "defined" | "controlled" | "audit-ready";
  breakpoints: Breakpoint[];
  fastFixes: FastFix[];
}

export interface Breakpoint {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

export interface FastFix {
  id: string;
  title: string;
  timeRequired: string;
  impact: string;
}

export interface MaturityStage {
  level: number;
  name: string;
  description: string;
  requirements: string[];
}

// ============================================
// Constants
// ============================================

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  crypto: "Cryptocurrency",
  nft: "NFTs & Collectibles",
  defi: "DeFi Positions",
  rwa: "Tokenized RWA",
  business: "Business Accounts",
  domain: "Domains & Digital Rights",
  other: "Other Assets",
};

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  owner: "Asset Owner",
  executor: "Executor",
  beneficiary: "Beneficiary",
  witness: "Witness",
  advisor: "Advisor",
};

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  death: "Death",
  incapacity: "Incapacity",
  keyPerson: "Key Person Event",
  custom: "Custom Trigger",
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
  "family-office": "Family Office",
  bank: "Bank / Institution",
  lawyer: "Lawyer / Notary",
  advisor: "Financial Advisor",
  individual: "Individual Investor",
};

export const PORTFOLIO_TYPE_LABELS: Record<PortfolioType, string> = {
  "crypto-heavy": "Crypto-Heavy Portfolio",
  entrepreneur: "Entrepreneur Assets",
  rwa: "RWA Hybrid",
  defi: "DeFi Risk Profile",
  balanced: "Balanced Portfolio",
};
