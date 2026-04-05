// ============================================
// Core Document Types
// ============================================

export interface MasterDocument {
  id: string;
  fileName: string;
  rawContent: string;
  chapters: Chapter[];
  totalWordCount: number;
  uploadedAt: string;
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  content: string;
  blocks: Block[];
}

export interface Block {
  id: string;
  chapterId: string;
  chapterIndex: number;
  blockIndex: number;
  globalIndex: number;
  originalText: string;
  wordCount: number;
  metadata: BlockMetadata;
}

export interface BlockMetadata {
  isHeading: boolean;
  isExecutiveSummary: boolean;
  isPricingSection: boolean;
  isAppendix: boolean;
  partNumber: 1 | 2 | 3 | null;
}

// ============================================
// Rewrite Pipeline Types
// ============================================

export type BlockStatus =
  | "pending"
  | "processing"
  | "review"
  | "failed"
  | "committed"
  | "skipped";

export interface BlockRewrite {
  blockId: string;
  status: BlockStatus;
  rewrittenText: string | null;
  rationale: string | null;
  validationResults: ValidationResult[];
  allRulesPassed: boolean;
  attempts: number;
  committedAt: string | null;
  userEdited: boolean;
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning";
}

// ============================================
// Pipeline Session
// ============================================

export interface PipelineSession {
  id: string;
  masterDocument: MasterDocument;
  profileId: ProfileId;
  blocks: Block[];
  rewrites: Record<string, BlockRewrite>;
  currentBlockIndex: number;
  status: "segmenting" | "rewriting" | "harmonizing" | "completed";
  startedAt: string;
  completedAt: string | null;
  stats: PipelineStats;
}

export interface PipelineStats {
  totalBlocks: number;
  committedBlocks: number;
  skippedBlocks: number;
  failedBlocks: number;
  pendingBlocks: number;
  totalAttempts: number;
}

// ============================================
// Profile Types
// ============================================

export type ProfileId = "institutional" | "hnwi";

export interface RewriteProfile {
  id: ProfileId;
  name: string;
  shortName: string;
  description: string;
  targetAudience: string;
  tone: ProfileTone;
  systemPrompt: string;
  blockPromptTemplate: string;
  terminologyMap: Record<string, string>;
  allowedClaims: string[];
  forbiddenPatterns: string[];
  glossary: Record<string, string>;
  styleGuide: StyleGuide;
}

export interface ProfileTone {
  formality: "formal" | "semi-formal" | "accessible";
  approach: "regulatory" | "strategic" | "technical" | "visionary" | "business";
  keywords: string[];
  avoidWords: string[];
}

export interface StyleGuide {
  maxSentenceLength: number;
  preferActiveVoice: boolean;
  useHeadingsStyle: "numbered" | "hierarchical" | "flat";
  paragraphMaxWords: number;
}

// ============================================
// Validation Rule Types
// ============================================

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning";
  category: "content" | "terminology" | "structure" | "compliance";
  validate: (text: string, block: Block, profile: RewriteProfile) => ValidationResult;
}

// ============================================
// LLM Configuration
// ============================================

export type LLMProvider = "openai" | "anthropic";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  rewrittenText: string;
  rationale: string;
  tokensUsed: number;
}

// ============================================
// Settings
// ============================================

export interface AppSettings {
  llmConfig: LLMConfig;
  autoAdvance: boolean;
  showDiffByDefault: boolean;
  blockSizeRange: { min: number; max: number };
}

// ============================================
// Harmonization
// ============================================

export interface HarmonizationResult {
  terminologyIssues: HarmonizationIssue[];
  crossRefIssues: HarmonizationIssue[];
  toc: string[];
  glossaryTerms: Record<string, string>;
  allPassed: boolean;
}

export interface HarmonizationIssue {
  blockId: string;
  type: "terminology" | "crossref" | "toc" | "glossary";
  message: string;
  severity: "error" | "warning" | "info";
}

// ============================================
// Constants
// ============================================

export const PROFILE_LABELS: Record<ProfileId, string> = {
  institutional: "Institutional Infrastructure (F&P)",
  hnwi: "HNWI Governance",
};

export const BLOCK_STATUS_LABELS: Record<BlockStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  review: "In Review",
  failed: "Failed",
  committed: "Committed",
  skipped: "Skipped",
};

export const BLOCK_STATUS_COLORS: Record<BlockStatus, string> = {
  pending: "bg-slate-300",
  processing: "bg-blue-400 animate-pulse",
  review: "bg-amber-400",
  failed: "bg-red-500",
  committed: "bg-green-500",
  skipped: "bg-slate-400",
};

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4o",
  temperature: 0.3,
  maxTokens: 1500,
};

export const DEFAULT_BLOCK_SIZE = { min: 120, max: 250 };
