import type { Block, BlockRewrite, MasterDocument, HarmonizationResult } from "../types";

/** Assemble the final document from committed blocks */
export function assembleDocument(
  doc: MasterDocument,
  _blocks: Block[],
  rewrites: Record<string, BlockRewrite>,
  harmonization: HarmonizationResult | null,
  profileName: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${doc.fileName.replace(/\.(txt|md)$/i, "")} — ${profileName}`);
  lines.push("");
  lines.push(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push("");

  // Table of Contents
  if (harmonization?.toc && harmonization.toc.length > 0) {
    lines.push("## Table of Contents");
    lines.push("");
    harmonization.toc.forEach((title, i) => {
      lines.push(`${i + 1}. ${title}`);
    });
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Body: iterate chapters → blocks
  for (const chapter of doc.chapters) {
    lines.push(`## ${chapter.title}`);
    lines.push("");

    for (const block of chapter.blocks) {
      const rewrite = rewrites[block.id];
      if (rewrite?.status === "committed" && rewrite.rewrittenText) {
        lines.push(rewrite.rewrittenText);
        lines.push("");
      } else if (rewrite?.status === "skipped") {
        // Use original text for skipped blocks
        lines.push(block.originalText);
        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
  }

  // Glossary
  if (harmonization?.glossaryTerms && Object.keys(harmonization.glossaryTerms).length > 0) {
    lines.push("## Glossary");
    lines.push("");
    const sortedTerms = Object.entries(harmonization.glossaryTerms).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    for (const [term, definition] of sortedTerms) {
      lines.push(`**${term}**: ${definition}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/** Trigger a browser download of the assembled document */
export function downloadDocument(content: string, fileName: string, format: "txt" | "md"): void {
  const extension = format === "md" ? ".md" : ".txt";
  const mimeType = format === "md" ? "text/markdown" : "text/plain";
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.replace(/\.(txt|md)$/i, "") + `-rewritten${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
