import type { ValidationRule, ValidationResult, Block, RewriteProfile } from "../types";

function makeResult(
  ruleId: string,
  ruleName: string,
  passed: boolean,
  message: string,
  severity: "error" | "warning"
): ValidationResult {
  return { ruleId, ruleName, passed, message, severity };
}

export const validationRules: ValidationRule[] = [
  // Rule 1: No percentage claims about loss probability
  {
    id: "no-percentage-claims",
    name: "No % Claims",
    description: "No percentage claims about loss probability or risk reduction",
    severity: "error",
    category: "compliance",
    validate: (text: string) => {
      const pattern = /\d+\s*%\s*(?:of\s+)?(?:loss|risk|reduction|probability|chance|likelihood)/i;
      const match = pattern.test(text);
      return makeResult(
        "no-percentage-claims",
        "No % Claims",
        !match,
        match ? "Found percentage claim about loss/risk probability" : "No percentage claims found",
        "error"
      );
    },
  },

  // Rule 2: No "Shield" words
  {
    id: "no-shield-words",
    name: 'No "Shield"',
    description: 'The word "Shield" must not appear in any form',
    severity: "error",
    category: "terminology",
    validate: (text: string) => {
      const pattern = /\bshield\b/i;
      const match = pattern.test(text);
      return makeResult(
        "no-shield-words",
        'No "Shield"',
        !match,
        match ? 'Found forbidden word "Shield"' : "No shield words found",
        "error"
      );
    },
  },

  // Rule 3: No "Guarantee / Impossible / Never fail"
  {
    id: "no-guarantees",
    name: "No Guarantees",
    description: 'No "Guarantee", "Impossible", "Never fail" language',
    severity: "error",
    category: "compliance",
    validate: (text: string) => {
      const pattern = /\b(guarantee[ds]?|impossible|never\s+fail|cannot\s+fail)\b/i;
      const match = text.match(pattern);
      return makeResult(
        "no-guarantees",
        "No Guarantees",
        !match,
        match ? `Found forbidden term: "${match[0]}"` : "No guarantee/absolute language found",
        "error"
      );
    },
  },

  // Rule 4: "No-Custody" must appear in Part 1 blocks
  {
    id: "no-custody-present",
    name: "No-Custody Ref",
    description: '"No-Custody" must appear at least once in Part 1',
    severity: "warning",
    category: "compliance",
    validate: (text: string, block: Block) => {
      if (block.metadata.partNumber !== 1) {
        return makeResult(
          "no-custody-present",
          "No-Custody Ref",
          true,
          "Not Part 1 — rule not applicable",
          "warning"
        );
      }
      const pattern = /no[- ]custody/i;
      const found = pattern.test(text);
      return makeResult(
        "no-custody-present",
        "No-Custody Ref",
        found,
        found
          ? "No-Custody reference found"
          : "Part 1 block missing No-Custody reference — consider adding it",
        "warning"
      );
    },
  },

  // Rule 5: Notary = Trigger, not Access
  {
    id: "notary-trigger",
    name: "Notary = Trigger",
    description: "When notary is mentioned, it must be as trigger, not access",
    severity: "error",
    category: "compliance",
    validate: (text: string) => {
      if (!/notar/i.test(text)) {
        return makeResult(
          "notary-trigger",
          "Notary = Trigger",
          true,
          "No notary reference — rule not applicable",
          "error"
        );
      }
      // Check if "access" appears near "notary" (within 100 chars)
      const accessPattern = /notar\w*[^.]{0,100}(?:access|hold|control|custody)/i;
      const badMatch = accessPattern.test(text);
      // Check if "trigger" appears near "notary"
      const triggerPattern = /notar\w*[^.]{0,100}trigger|trigger[^.]{0,100}notar\w*/i;
      const goodMatch = triggerPattern.test(text);
      const passed = !badMatch || goodMatch;
      return makeResult(
        "notary-trigger",
        "Notary = Trigger",
        passed,
        passed
          ? "Notary correctly positioned as trigger"
          : "Notary appears to grant access — must be trigger only",
        "error"
      );
    },
  },

  // Rule 6: Multisig configuration stays consistent
  {
    id: "multisig-consistent",
    name: "Multisig Config",
    description: "Multisig notation (2-of-2, 2-of-3) must stay consistent with source",
    severity: "error",
    category: "content",
    validate: (text: string, block: Block) => {
      const rewritePattern = /(\d)-of-(\d)/g;
      const originalPattern = /(\d)-of-(\d)/g;
      const rewriteMatches = [...text.matchAll(rewritePattern)].map((m) => m[0]);
      const originalMatches = [...block.originalText.matchAll(originalPattern)].map((m) => m[0]);

      if (rewriteMatches.length === 0) {
        return makeResult(
          "multisig-consistent",
          "Multisig Config",
          true,
          "No multisig notation found",
          "error"
        );
      }

      // Check that rewrite multisig values match original
      const mismatch = rewriteMatches.find((m) => !originalMatches.includes(m));
      return makeResult(
        "multisig-consistent",
        "Multisig Config",
        !mismatch,
        mismatch
          ? `Multisig "${mismatch}" in rewrite not found in original`
          : "Multisig notation consistent",
        "error"
      );
    },
  },

  // Rule 7: Pricing only in Part 3
  {
    id: "pricing-part3-only",
    name: "Pricing in Part 3",
    description: "Pricing/fee content must only appear in Part 3",
    severity: "error",
    category: "structure",
    validate: (text: string, block: Block) => {
      if (block.metadata.partNumber === 3 || block.metadata.isPricingSection) {
        return makeResult(
          "pricing-part3-only",
          "Pricing in Part 3",
          true,
          "Part 3 / pricing section — pricing allowed",
          "error"
        );
      }
      const pricingPattern = /\b(pricing|price list|fee schedule|subscription|€\s*\d|EUR\s*\d|USD\s*\d|\$\s*\d)/i;
      const match = pricingPattern.test(text);
      return makeResult(
        "pricing-part3-only",
        "Pricing in Part 3",
        !match,
        match
          ? "Pricing content found outside Part 3"
          : "No pricing content outside Part 3",
        "error"
      );
    },
  },

  // Rule 8: Revenue Share as "optional alignment"
  {
    id: "revenue-share-optional",
    name: "Rev. Share Optional",
    description: "Revenue share must be framed as optional alignment",
    severity: "warning",
    category: "compliance",
    validate: (text: string) => {
      if (!/revenue\s+share/i.test(text)) {
        return makeResult(
          "revenue-share-optional",
          "Rev. Share Optional",
          true,
          "No revenue share mention — rule not applicable",
          "warning"
        );
      }
      const optionalNearby =
        /(?:optional|alignment|voluntary|elective)[^.]{0,80}revenue\s+share|revenue\s+share[^.]{0,80}(?:optional|alignment|voluntary|elective)/i;
      const hasOptional = optionalNearby.test(text);
      return makeResult(
        "revenue-share-optional",
        "Rev. Share Optional",
        hasOptional,
        hasOptional
          ? "Revenue share correctly framed as optional"
          : "Revenue share mentioned without 'optional' context",
        "warning"
      );
    },
  },

  // Rule 9: No threat formulations regarding liability
  {
    id: "no-threat-language",
    name: "No Threats",
    description: "No threatening language regarding liability",
    severity: "error",
    category: "compliance",
    validate: (text: string) => {
      const threats =
        /\b(will\s+be\s+(?:held\s+)?liable|face\s+(?:legal\s+)?consequences|will\s+sue|face\s+penalties|punish|held\s+responsible\s+for|legal\s+action\s+against)\b/i;
      const match = text.match(threats);
      return makeResult(
        "no-threat-language",
        "No Threats",
        !match,
        match
          ? `Found threat language: "${match[0]}"`
          : "No threat language found",
        "error"
      );
    },
  },

  // Rule 10: No technical details in Executive Summary
  {
    id: "no-tech-exec-summary",
    name: "No Tech in ES",
    description: "Executive Summary blocks must not contain technical implementation details",
    severity: "warning",
    category: "structure",
    validate: (text: string, block: Block) => {
      if (!block.metadata.isExecutiveSummary) {
        return makeResult(
          "no-tech-exec-summary",
          "No Tech in ES",
          true,
          "Not Executive Summary — rule not applicable",
          "warning"
        );
      }
      const techTerms =
        /\b(API|SDK|endpoint|hash|SHA-256|cryptographic\s+(?:key|protocol)|smart\s+contract|blockchain\s+(?:node|validator)|gas\s+fee|solidity|docker|kubernetes)\b/i;
      const match = text.match(techTerms);
      return makeResult(
        "no-tech-exec-summary",
        "No Tech in ES",
        !match,
        match
          ? `Technical term "${match[0]}" found in Executive Summary`
          : "No technical details in Executive Summary",
        "warning"
      );
    },
  },
];

export function validateBlock(
  text: string,
  block: Block,
  profile: RewriteProfile
): ValidationResult[] {
  return validationRules.map((rule) => rule.validate(text, block, profile));
}
