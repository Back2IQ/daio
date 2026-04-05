import type { MasterDocument, Chapter, Block, BlockMetadata } from "../types";

let globalBlockCounter = 0;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Detect part number from chapter title or index */
function detectPartNumber(title: string, chapterIndex: number): 1 | 2 | 3 | null {
  const partMatch = title.match(/part\s+(\d)/i);
  if (partMatch) {
    const num = parseInt(partMatch[1], 10);
    if (num >= 1 && num <= 3) return num as 1 | 2 | 3;
  }
  // Heuristic: first third of chapters = Part 1, etc.
  if (chapterIndex < 3) return 1;
  if (chapterIndex < 6) return 2;
  return 3;
}

function detectMetadata(
  text: string,
  chapterTitle: string,
  chapterIndex: number
): BlockMetadata {
  const lowerTitle = chapterTitle.toLowerCase();
  const lowerText = text.toLowerCase();

  return {
    isHeading: /^#{1,3}\s/.test(text.trim()) || /^\d+\.\s+[A-Z]/.test(text.trim()),
    isExecutiveSummary:
      lowerTitle.includes("executive summary") ||
      lowerTitle.includes("overview") ||
      lowerTitle.includes("zusammenfassung"),
    isPricingSection:
      lowerTitle.includes("pricing") ||
      lowerTitle.includes("fee") ||
      lowerTitle.includes("cost") ||
      lowerTitle.includes("preis") ||
      lowerText.includes("pricing model"),
    isAppendix:
      lowerTitle.includes("appendix") ||
      lowerTitle.includes("annex") ||
      lowerTitle.includes("anhang"),
    partNumber: detectPartNumber(chapterTitle, chapterIndex),
  };
}

/** Split text at sentence boundaries */
function splitAtSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace
  const sentences: string[] = [];
  const regex = /[^.!?]*[.!?]+(?:\s+|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sentences.push(match[0]);
  }
  // If there's remaining text without terminal punctuation, add it
  const joined = sentences.join("");
  if (joined.length < text.length) {
    sentences.push(text.slice(joined.length));
  }
  if (sentences.length === 0 && text.trim()) {
    sentences.push(text);
  }
  return sentences.filter((s) => s.trim().length > 0);
}

/** Create atomic blocks from a paragraph, targeting 120-250 words */
function createBlocksFromParagraph(
  paragraph: string,
  minWords: number,
  maxWords: number
): string[] {
  const wordCount = countWords(paragraph);

  // If within range, return as single block
  if (wordCount >= minWords && wordCount <= maxWords) {
    return [paragraph.trim()];
  }

  // If too small, return as-is (will be merged later)
  if (wordCount < minWords) {
    return [paragraph.trim()];
  }

  // If too large, split at sentence boundaries
  const sentences = splitAtSentences(paragraph);
  const blocks: string[] = [];
  let currentBlock = "";

  for (const sentence of sentences) {
    const combinedWords = countWords(currentBlock + sentence);
    if (combinedWords <= maxWords) {
      currentBlock += sentence;
    } else {
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
      }
      currentBlock = sentence;
    }
  }
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  return blocks;
}

/** Merge small blocks together to meet minimum word count */
function mergeSmallBlocks(blocks: string[], minWords: number): string[] {
  const merged: string[] = [];
  let accumulator = "";

  for (const block of blocks) {
    if (accumulator) {
      accumulator += "\n\n" + block;
    } else {
      accumulator = block;
    }
    if (countWords(accumulator) >= minWords) {
      merged.push(accumulator.trim());
      accumulator = "";
    }
  }
  // Handle remaining accumulator
  if (accumulator.trim()) {
    if (merged.length > 0 && countWords(accumulator) < minWords) {
      // Merge with previous block
      merged[merged.length - 1] += "\n\n" + accumulator.trim();
    } else {
      merged.push(accumulator.trim());
    }
  }

  return merged;
}

/** Split raw content into chapters based on heading patterns */
function splitIntoChapters(rawContent: string): { title: string; content: string }[] {
  // Match headings: # Title, ## Title, ### Title, or "Chapter N:", or "N. Title"
  const headingPattern = /^(#{1,3}\s+.+|Chapter\s+\d+[:.].+|\d+\.\s+[A-Z].{2,})$/gm;

  const chapters: { title: string; content: string }[] = [];
  const matches = [...rawContent.matchAll(headingPattern)];

  if (matches.length === 0) {
    // No headings found — treat entire content as one chapter
    return [{ title: "Document", content: rawContent.trim() }];
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const title = match[0].replace(/^#{1,3}\s+/, "").trim();
    const startIdx = match.index! + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : rawContent.length;
    const content = rawContent.slice(startIdx, endIdx).trim();

    if (content) {
      chapters.push({ title, content });
    }
  }

  return chapters;
}

/** Main segmentation function: raw content → MasterDocument */
export function segmentDocument(
  rawContent: string,
  fileName: string,
  blockSizeMin = 120,
  blockSizeMax = 250
): MasterDocument {
  globalBlockCounter = 0;

  const rawChapters = splitIntoChapters(rawContent);
  const chapters: Chapter[] = [];

  for (let ci = 0; ci < rawChapters.length; ci++) {
    const { title, content } = rawChapters[ci];
    const chapterId = generateId();

    // Split content into paragraphs (double newline)
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Create blocks from paragraphs
    let rawBlocks: string[] = [];
    for (const para of paragraphs) {
      const paraBlocks = createBlocksFromParagraph(para, blockSizeMin, blockSizeMax);
      rawBlocks.push(...paraBlocks);
    }

    // Merge small blocks
    rawBlocks = mergeSmallBlocks(rawBlocks, blockSizeMin);

    // Create Block objects
    const blocks: Block[] = rawBlocks.map((text, bi) => ({
      id: generateId(),
      chapterId,
      chapterIndex: ci,
      blockIndex: bi,
      globalIndex: globalBlockCounter++,
      originalText: text,
      wordCount: countWords(text),
      metadata: detectMetadata(text, title, ci),
    }));

    chapters.push({
      id: chapterId,
      index: ci,
      title,
      content,
      blocks,
    });
  }


  return {
    id: generateId(),
    fileName,
    rawContent,
    chapters,
    totalWordCount: countWords(rawContent),
    uploadedAt: new Date().toISOString(),
  };
}

/** Get all blocks from a document in order */
export function getAllBlocks(doc: MasterDocument): Block[] {
  return doc.chapters.flatMap((ch) => ch.blocks);
}
