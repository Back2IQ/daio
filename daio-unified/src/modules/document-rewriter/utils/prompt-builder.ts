import type { Block, RewriteProfile } from "../types";

/** Build the user prompt for a block rewrite */
export function buildBlockPrompt(
  block: Block,
  profile: RewriteProfile,
  chapterTitle: string,
  totalBlocksInChapter: number,
  previousBlockText?: string
): string {
  let prompt = profile.blockPromptTemplate
    .replace("{{originalText}}", block.originalText)
    .replace("{{chapterTitle}}", chapterTitle)
    .replace("{{blockIndex}}", String(block.blockIndex + 1))
    .replace("{{totalBlocksInChapter}}", String(totalBlocksInChapter))
    .replace("{{partNumber}}", String(block.metadata.partNumber ?? "N/A"));

  // Add context from previous block for continuity
  if (previousBlockText) {
    prompt += `\n\nContext from previous block (for continuity):\n"${previousBlockText.slice(0, 300)}${previousBlockText.length > 300 ? "..." : ""}"`;
  }

  return prompt;
}

/** Build a regeneration prompt with an additional constraint */
export function buildRegenerationPrompt(
  block: Block,
  profile: RewriteProfile,
  chapterTitle: string,
  totalBlocksInChapter: number,
  constraint: string,
  previousAttempt: string
): string {
  const basePrompt = buildBlockPrompt(
    block,
    profile,
    chapterTitle,
    totalBlocksInChapter
  );

  return `${basePrompt}

IMPORTANT: The previous rewrite attempt was rejected. Here was the previous attempt:
"${previousAttempt}"

Additional constraint for this attempt: ${constraint}

Please rewrite the block again, addressing the constraint above.`;
}
