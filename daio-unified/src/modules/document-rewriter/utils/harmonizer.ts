import type {
  Block,
  BlockRewrite,
  RewriteProfile,
  MasterDocument,
  HarmonizationResult,
  HarmonizationIssue,
} from "../types";

/** Run global harmonization checks across all committed blocks */
export function harmonize(
  doc: MasterDocument,
  blocks: Block[],
  rewrites: Record<string, BlockRewrite>,
  profile: RewriteProfile
): HarmonizationResult {
  const terminologyIssues: HarmonizationIssue[] = [];
  const crossRefIssues: HarmonizationIssue[] = [];
  const toc: string[] = [];
  const usedGlossaryTerms: Record<string, string> = {};

  // Collect committed block texts
  const committedBlocks = blocks.filter(
    (b) => rewrites[b.id]?.status === "committed"
  );
  const allText = committedBlocks
    .map((b) => rewrites[b.id]?.rewrittenText ?? "")
    .join("\n\n");

  // 1. Build TOC from chapter titles
  for (const chapter of doc.chapters) {
    toc.push(chapter.title);
  }

  // 2. Terminology consistency check
  for (const [oldTerm, newTerm] of Object.entries(profile.terminologyMap)) {
    const oldRegex = new RegExp(`\\b${oldTerm}\\b`, "gi");
    for (const block of committedBlocks) {
      const text = rewrites[block.id]?.rewrittenText ?? "";
      if (oldRegex.test(text)) {
        terminologyIssues.push({
          blockId: block.id,
          type: "terminology",
          message: `Block ${block.globalIndex + 1}: "${oldTerm}" should be "${newTerm}"`,
          severity: "warning",
        });
      }
    }
  }

  // 3. Cross-reference check: do chapter references match actual chapters?

  for (const block of committedBlocks) {
    const text = rewrites[block.id]?.rewrittenText ?? "";
    // Look for "Chapter X" or "Part X" references
    const chapterRefs = text.matchAll(/(?:chapter|part|section)\s+(\d+)/gi);
    for (const match of chapterRefs) {
      const refNum = parseInt(match[1], 10);
      if (refNum > doc.chapters.length) {
        crossRefIssues.push({
          blockId: block.id,
          type: "crossref",
          message: `Block ${block.globalIndex + 1}: References "${match[0]}" but only ${doc.chapters.length} chapters exist`,
          severity: "warning",
        });
      }
    }
  }

  // 4. No-Custody check across Part 1
  const part1Blocks = committedBlocks.filter(
    (b) => b.metadata.partNumber === 1
  );
  const part1Text = part1Blocks
    .map((b) => rewrites[b.id]?.rewrittenText ?? "")
    .join(" ");
  if (part1Blocks.length > 0 && !/no[- ]custody/i.test(part1Text)) {
    crossRefIssues.push({
      blockId: part1Blocks[0].id,
      type: "crossref",
      message: "Part 1 does not contain any 'No-Custody' reference",
      severity: "error",
    });
  }

  // 5. Build glossary from profile — only include terms that appear in text
  for (const [term, definition] of Object.entries(profile.glossary)) {
    const termRegex = new RegExp(`\\b${term}\\b`, "i");
    if (termRegex.test(allText)) {
      usedGlossaryTerms[term] = definition;
    }
  }

  const allPassed =
    terminologyIssues.every((i) => i.severity !== "error") &&
    crossRefIssues.every((i) => i.severity !== "error");

  return {
    terminologyIssues,
    crossRefIssues,
    toc,
    glossaryTerms: usedGlossaryTerms,
    allPassed,
  };
}
