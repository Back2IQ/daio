import type { Block, RewriteProfile, ValidationResult } from "../types";
import { validationRules, validateBlock } from "../config/rules";
import { FORBIDDEN_TERMS } from "../config/terminology";

/** Run all validation rules against a rewritten text block */
export function runValidation(
  rewrittenText: string,
  block: Block,
  profile: RewriteProfile
): { results: ValidationResult[]; allPassed: boolean } {
  const results = validateBlock(rewrittenText, block, profile);

  // Additional: check profile-specific forbidden patterns
  for (const pattern of profile.forbiddenPatterns) {
    try {
      const regex = new RegExp(pattern, "i");
      if (regex.test(rewrittenText)) {
        const existing = results.find((r) => r.passed === false);
        if (!existing) {
          results.push({
            ruleId: "profile-forbidden-pattern",
            ruleName: "Profile Pattern",
            passed: false,
            message: `Matched forbidden pattern: ${pattern}`,
            severity: "error",
          });
        }
      }
    } catch {
      // Invalid regex pattern — skip
    }
  }

  // Check global forbidden terms
  for (const term of FORBIDDEN_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(rewrittenText)) {
      const alreadyCaught = results.some(
        (r) => !r.passed && r.message.toLowerCase().includes(term.toLowerCase())
      );
      if (!alreadyCaught) {
        results.push({
          ruleId: "global-forbidden-term",
          ruleName: "Forbidden Term",
          passed: false,
          message: `Contains forbidden term: "${term}"`,
          severity: "error",
        });
      }
    }
  }

  // Apply terminology guard: warn if old terms still present
  for (const [oldTerm, newTerm] of Object.entries(profile.terminologyMap)) {
    const regex = new RegExp(`\\b${oldTerm}\\b`, "i");
    if (regex.test(rewrittenText)) {
      results.push({
        ruleId: "terminology-guard",
        ruleName: "Terminology",
        passed: false,
        message: `"${oldTerm}" should be replaced with "${newTerm}"`,
        severity: "warning",
      });
    }
  }

  const allPassed = results.every(
    (r) => r.passed || r.severity === "warning"
  );

  return { results, allPassed };
}

/** Get just the error-level failures */
export function getErrors(results: ValidationResult[]): ValidationResult[] {
  return results.filter((r) => !r.passed && r.severity === "error");
}

/** Get just the warnings */
export function getWarnings(results: ValidationResult[]): ValidationResult[] {
  return results.filter((r) => !r.passed && r.severity === "warning");
}

export { validationRules };
