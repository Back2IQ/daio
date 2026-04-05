import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MasterDocument,
  Block,
  BlockRewrite,
  BlockStatus,
  ProfileId,
  PipelineStats,
  AppSettings,
  LLMConfig,
  ValidationResult,
  HarmonizationResult,
} from "../types";
import { DEFAULT_LLM_CONFIG, DEFAULT_BLOCK_SIZE } from "../types";
import { segmentDocument, getAllBlocks } from "../utils/segmenter";
import { institutionalProfile } from "../config/profiles/institutional";
import { hnwiProfile } from "../config/profiles/hnwi";
import type { RewriteProfile } from "../types";

export type AppPhase = "upload" | "rewriting" | "harmonizing" | "completed";

const PROFILES: Record<ProfileId, RewriteProfile> = {
  institutional: institutionalProfile,
  hnwi: hnwiProfile,
};

export function getProfile(id: ProfileId): RewriteProfile {
  return PROFILES[id];
}

interface PipelineState {
  // Phase
  phase: AppPhase;

  // Document & blocks
  masterDocument: MasterDocument | null;
  blocks: Block[];
  profileId: ProfileId;

  // Rewrites
  rewrites: Record<string, BlockRewrite>;
  currentBlockIndex: number;

  // Harmonization
  harmonizationResult: HarmonizationResult | null;

  // Settings
  settings: AppSettings;

  // Actions
  setPhase: (phase: AppPhase) => void;
  startSession: (rawContent: string, fileName: string, profileId: ProfileId) => void;
  setCurrentBlock: (index: number) => void;
  setBlockRewrite: (blockId: string, rewrite: Partial<BlockRewrite>) => void;
  commitBlock: (blockId: string) => void;
  skipBlock: (blockId: string) => void;
  setBlockStatus: (blockId: string, status: BlockStatus) => void;
  updateRewriteText: (blockId: string, text: string) => void;
  setValidationResults: (blockId: string, results: ValidationResult[], allPassed: boolean) => void;
  advanceToNextBlock: () => void;
  setHarmonizationResult: (result: HarmonizationResult) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateLLMConfig: (config: Partial<LLMConfig>) => void;
  reset: () => void;

  // Computed
  getStats: () => PipelineStats;
  getCurrentBlock: () => Block | null;
  getCurrentRewrite: () => BlockRewrite | null;
  getProfile: () => RewriteProfile;
}

const initialSettings: AppSettings = {
  llmConfig: DEFAULT_LLM_CONFIG,
  autoAdvance: true,
  showDiffByDefault: true,
  blockSizeRange: DEFAULT_BLOCK_SIZE,
};

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      phase: "upload",
      masterDocument: null,
      blocks: [],
      profileId: "institutional",
      rewrites: {},
      currentBlockIndex: 0,
      harmonizationResult: null,
      settings: initialSettings,

      setPhase: (phase) => set({ phase }),

      startSession: (rawContent, fileName, profileId) => {
        const { blockSizeRange } = get().settings;
        const doc = segmentDocument(rawContent, fileName, blockSizeRange.min, blockSizeRange.max);
        const blocks = getAllBlocks(doc);

        // Initialize rewrites for all blocks
        const rewrites: Record<string, BlockRewrite> = {};
        for (const block of blocks) {
          rewrites[block.id] = {
            blockId: block.id,
            status: "pending",
            rewrittenText: null,
            rationale: null,
            validationResults: [],
            allRulesPassed: false,
            attempts: 0,
            committedAt: null,
            userEdited: false,
          };
        }

        set({
          phase: "rewriting",
          masterDocument: doc,
          blocks,
          profileId,
          rewrites,
          currentBlockIndex: 0,
          harmonizationResult: null,
        });
      },

      setCurrentBlock: (index) => set({ currentBlockIndex: index }),

      setBlockRewrite: (blockId, rewrite) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              ...rewrite,
            },
          },
        })),

      commitBlock: (blockId) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              status: "committed",
              committedAt: new Date().toISOString(),
            },
          },
        })),

      skipBlock: (blockId) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              status: "skipped",
            },
          },
        })),

      setBlockStatus: (blockId, status) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              status,
            },
          },
        })),

      updateRewriteText: (blockId, text) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              rewrittenText: text,
              userEdited: true,
            },
          },
        })),

      setValidationResults: (blockId, results, allPassed) =>
        set((state) => ({
          rewrites: {
            ...state.rewrites,
            [blockId]: {
              ...state.rewrites[blockId],
              validationResults: results,
              allRulesPassed: allPassed,
            },
          },
        })),

      advanceToNextBlock: () => {
        const { currentBlockIndex, blocks } = get();
        if (currentBlockIndex < blocks.length - 1) {
          set({ currentBlockIndex: currentBlockIndex + 1 });
        }
      },

      setHarmonizationResult: (result) => set({ harmonizationResult: result }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      updateLLMConfig: (config) =>
        set((state) => ({
          settings: {
            ...state.settings,
            llmConfig: { ...state.settings.llmConfig, ...config },
          },
        })),

      reset: () =>
        set({
          phase: "upload",
          masterDocument: null,
          blocks: [],
          rewrites: {},
          currentBlockIndex: 0,
          harmonizationResult: null,
        }),

      getStats: () => {
        const { rewrites, blocks } = get();
        const stats: PipelineStats = {
          totalBlocks: blocks.length,
          committedBlocks: 0,
          skippedBlocks: 0,
          failedBlocks: 0,
          pendingBlocks: 0,
          totalAttempts: 0,
        };

        for (const blockId of Object.keys(rewrites)) {
          const r = rewrites[blockId];
          stats.totalAttempts += r.attempts;
          switch (r.status) {
            case "committed":
              stats.committedBlocks++;
              break;
            case "skipped":
              stats.skippedBlocks++;
              break;
            case "failed":
              stats.failedBlocks++;
              break;
            case "pending":
            case "processing":
            case "review":
              stats.pendingBlocks++;
              break;
          }
        }

        return stats;
      },

      getCurrentBlock: () => {
        const { blocks, currentBlockIndex } = get();
        return blocks[currentBlockIndex] ?? null;
      },

      getCurrentRewrite: () => {
        const { blocks, currentBlockIndex, rewrites } = get();
        const block = blocks[currentBlockIndex];
        if (!block) return null;
        return rewrites[block.id] ?? null;
      },

      getProfile: () => {
        return PROFILES[get().profileId];
      },
    }),
    {
      name: "daio-rewriter-session",
      partialize: (state) => ({
        phase: state.phase,
        masterDocument: state.masterDocument,
        blocks: state.blocks,
        profileId: state.profileId,
        rewrites: state.rewrites,
        currentBlockIndex: state.currentBlockIndex,
        settings: state.settings,
      }),
    }
  )
);
