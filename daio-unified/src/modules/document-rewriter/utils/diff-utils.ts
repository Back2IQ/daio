import { diffWords } from "diff";

export interface DiffSegment {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/** Compute word-level diff between original and rewritten text */
export function computeDiff(original: string, rewritten: string): DiffSegment[] {
  return diffWords(original, rewritten);
}

/** Count additions and removals */
export function diffStats(segments: DiffSegment[]): {
  additions: number;
  removals: number;
  unchanged: number;
} {
  let additions = 0;
  let removals = 0;
  let unchanged = 0;

  for (const seg of segments) {
    const wordCount = seg.value.trim().split(/\s+/).filter(Boolean).length;
    if (seg.added) additions += wordCount;
    else if (seg.removed) removals += wordCount;
    else unchanged += wordCount;
  }

  return { additions, removals, unchanged };
}
