export const HOOK_DATA = {
  headlineNumber: 8.2,
  unit: "Mrd.",
  currency: "€",
  subtitle: "in digital assets become inaccessible after the owner's death — annually",
};

export interface Persona {
  id: string;
  title: string;
  icon: string;
  color: string;
  painPoints: string[];
}

export const PERSONAS: Persona[] = [
  {
    id: "family-office",
    title: "Family Offices",
    icon: "Building2",
    color: "blue",
    painPoints: [
      "No visibility into digital asset holdings across family members",
      "Cannot verify completeness of inherited portfolios",
      "No established process for digital succession",
    ],
  },
  {
    id: "platform-operator",
    title: "Platform Operators",
    icon: "Server",
    color: "amber",
    painPoints: [
      "No standardized death-event handling process",
      "Dormant accounts accumulate without resolution",
      "Regulatory exposure from unresolved estates",
    ],
  },
  {
    id: "regulator",
    title: "Regulators & Advisors",
    icon: "Scale",
    color: "emerald",
    painPoints: [
      "No reliable data on digital asset inheritance losses",
      "Cannot quantify systemic risk in the ecosystem",
      "Policy decisions based on anecdotal evidence only",
    ],
  },
];

export interface PioneerCaseAsset {
  name: string;
  beforeValue: number;
  afterValue: number;
  color: string;
}

export const PIONEER_CASE = {
  beforeTotal: 850000,
  afterRecovered: 720000,
  recoveryRate: 84.7,
  assets: [
    { name: "Cryptocurrency", beforeValue: 520000, afterValue: 480000, color: "#f59e0b" },
    { name: "NFT Collections", beforeValue: 180000, afterValue: 120000, color: "#8b5cf6" },
    { name: "YouTube Channel", beforeValue: 95000, afterValue: 75000, color: "#ef4444" },
    { name: "Gaming Assets", beforeValue: 55000, afterValue: 45000, color: "#3b82f6" },
  ] as PioneerCaseAsset[],
};

export interface PipelinePhase {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export const PIPELINE_PHASES: PipelinePhase[] = [
  { id: 1, name: "Client Acquisition", description: "Onboarding & consultation", icon: "UserPlus" },
  { id: 2, name: "Asset Discovery", description: "Systematic identification", icon: "Search" },
  { id: 3, name: "Container Creation", description: "Secure container setup", icon: "Package" },
  { id: 4, name: "Legacy Proof", description: "Cryptographic proof chain", icon: "FileCheck" },
  { id: 5, name: "Transfer Gate", description: "Multi-sig approval", icon: "KeyRound" },
  { id: 6, name: "Sentinel", description: "Life-signal monitoring", icon: "Eye" },
  { id: 7, name: "Activation", description: "Succession protocol", icon: "Zap" },
  { id: 8, name: "Completion", description: "Transfer & closure", icon: "CheckCircle" },
  { id: 9, name: "Compliance", description: "Audit trail & reporting", icon: "ShieldCheck" },
];

export interface KPICard {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color: string;
}

export const KPI_CARDS: KPICard[] = [
  { value: 25, prefix: "€", suffix: "k", label: "One-Time License", color: "blue" },
  { value: 6, suffix: " Weeks", label: "Time to MVP", color: "amber" },
  { value: 5, label: "Minimum Cases", color: "emerald" },
  { value: 30, suffix: "%", label: "Conversion Target", color: "purple" },
  { value: 100, prefix: "€", suffix: "k", label: "Revenue (6 Months)", color: "cyan" },
  { value: 3, suffix: "x", label: "ROI Potential", color: "rose" },
];

export const ROADMAP_STEPS = [
  { week: "1-2", label: "Setup & Onboarding", description: "License activation, data agreements, UX wireframes" },
  { week: "3-4", label: "Build & Ingest", description: "Frontend, inference engine, first cases" },
  { week: "5-6", label: "MVP & Validation", description: "Risk Intelligence Report, live demo" },
];
