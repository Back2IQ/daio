import { useCallback, useState } from "react";
import { usePipelineStore, getProfile } from "../store/pipeline-store";
import { callLLM } from "../utils/llm-client";
import { buildBlockPrompt, buildRegenerationPrompt } from "../utils/prompt-builder";
import { runValidation } from "../utils/validators";
import { harmonize } from "../utils/harmonizer";
import type { LLMResponse } from "../types";

export function usePipeline() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const store = usePipelineStore();

  /** Process the current block: call LLM, validate, set rewrite */
  const processCurrentBlock = useCallback(async () => {
    const block = store.getCurrentBlock();
    if (!block || !store.masterDocument) return;

    const profile = getProfile(store.profileId);
    const chapter = store.masterDocument.chapters.find(
      (ch) => ch.id === block.chapterId
    );
    if (!chapter) return;

    setIsProcessing(true);
    setError(null);

    // Set status to processing
    store.setBlockStatus(block.id, "processing");

    try {
      // Get previous committed block text for context
      const prevBlockIndex = store.currentBlockIndex - 1;
      let prevBlockText: string | undefined;
      if (prevBlockIndex >= 0) {
        const prevBlock = store.blocks[prevBlockIndex];
        const prevRewrite = store.rewrites[prevBlock.id];
        if (prevRewrite?.status === "committed" && prevRewrite.rewrittenText) {
          prevBlockText = prevRewrite.rewrittenText;
        }
      }

      // Build prompt
      const userPrompt = buildBlockPrompt(
        block,
        profile,
        chapter.title,
        chapter.blocks.length,
        prevBlockText
      );

      // Call LLM
      const response: LLMResponse = await callLLM(
        store.settings.llmConfig,
        profile.systemPrompt,
        userPrompt
      );

      // Validate
      const { results, allPassed } = runValidation(
        response.rewrittenText,
        block,
        profile
      );

      // Update store
      store.setBlockRewrite(block.id, {
        status: "review",
        rewrittenText: response.rewrittenText,
        rationale: response.rationale,
        validationResults: results,
        allRulesPassed: allPassed,
        attempts: (store.rewrites[block.id]?.attempts ?? 0) + 1,
        userEdited: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      store.setBlockStatus(block.id, "failed");
    } finally {
      setIsProcessing(false);
    }
  }, [store]);

  /** Regenerate with an additional constraint */
  const regenerateBlock = useCallback(
    async (constraint: string) => {
      const block = store.getCurrentBlock();
      if (!block || !store.masterDocument) return;

      const profile = getProfile(store.profileId);
      const chapter = store.masterDocument.chapters.find(
        (ch) => ch.id === block.chapterId
      );
      if (!chapter) return;

      const currentRewrite = store.rewrites[block.id];
      const previousAttempt = currentRewrite?.rewrittenText ?? "";

      setIsProcessing(true);
      setError(null);
      store.setBlockStatus(block.id, "processing");

      try {
        const userPrompt = buildRegenerationPrompt(
          block,
          profile,
          chapter.title,
          chapter.blocks.length,
          constraint,
          previousAttempt
        );

        const response: LLMResponse = await callLLM(
          store.settings.llmConfig,
          profile.systemPrompt,
          userPrompt
        );

        const { results, allPassed } = runValidation(
          response.rewrittenText,
          block,
          profile
        );

        store.setBlockRewrite(block.id, {
          status: "review",
          rewrittenText: response.rewrittenText,
          rationale: response.rationale,
          validationResults: results,
          allRulesPassed: allPassed,
          attempts: (store.rewrites[block.id]?.attempts ?? 0) + 1,
          userEdited: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        store.setBlockStatus(block.id, "failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [store]
  );

  /** Re-validate after manual edit (no LLM call) */
  const revalidateCurrentBlock = useCallback(() => {
    const block = store.getCurrentBlock();
    if (!block) return;

    const rewrite = store.rewrites[block.id];
    if (!rewrite?.rewrittenText) return;

    const profile = getProfile(store.profileId);
    const { results, allPassed } = runValidation(
      rewrite.rewrittenText,
      block,
      profile
    );

    store.setValidationResults(block.id, results, allPassed);
  }, [store]);

  /** Commit current block and optionally advance */
  const commitCurrentBlock = useCallback(() => {
    const block = store.getCurrentBlock();
    if (!block) return;

    store.commitBlock(block.id);

    if (store.settings.autoAdvance) {
      store.advanceToNextBlock();
    }
  }, [store]);

  /** Skip current block and advance */
  const skipCurrentBlock = useCallback(() => {
    const block = store.getCurrentBlock();
    if (!block) return;

    store.skipBlock(block.id);
    store.advanceToNextBlock();
  }, [store]);

  /** Run harmonization on all committed blocks */
  const runHarmonization = useCallback(() => {
    if (!store.masterDocument) return;

    const profile = getProfile(store.profileId);
    const result = harmonize(
      store.masterDocument,
      store.blocks,
      store.rewrites,
      profile
    );

    store.setHarmonizationResult(result);
    store.setPhase("harmonizing");
  }, [store]);

  /** Check if all blocks are processed */
  const allBlocksDone = useCallback(() => {
    return store.blocks.every((b) => {
      const status = store.rewrites[b.id]?.status;
      return status === "committed" || status === "skipped";
    });
  }, [store]);

  return {
    isProcessing,
    error,
    processCurrentBlock,
    regenerateBlock,
    revalidateCurrentBlock,
    commitCurrentBlock,
    skipCurrentBlock,
    runHarmonization,
    allBlocksDone,
  };
}
