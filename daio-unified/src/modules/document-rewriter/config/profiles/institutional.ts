import type { RewriteProfile } from "../../types";

export const institutionalProfile: RewriteProfile = {
  id: "institutional",
  name: "Institutional Infrastructure",
  shortName: "F&P Institutional",
  description: "Formal governance document for structured capital houses and family offices",
  targetAudience: "Family offices, institutional allocators, structured capital houses (F&P)",
  tone: {
    formality: "formal",
    approach: "regulatory",
    keywords: [
      "governance infrastructure",
      "operational continuity",
      "fiduciary framework",
      "institutional-grade",
      "compliance-aligned",
      "structured process",
      "no-custody architecture",
    ],
    avoidWords: [
      "shield",
      "protect",
      "guarantee",
      "never fail",
      "impossible",
      "threat",
      "risk-free",
    ],
  },
  systemPrompt: `You are a governance document specialist rewriting content for institutional infrastructure audiences. Your tone is formal, precise, and regulatory-aligned. You write as if preparing a document that will be reviewed by compliance officers, fiduciary boards, and institutional allocators. Every claim must be defensible. Prefer clear, authoritative statements. Always reference the No-Custody principle. Never make percentage-based claims about risk reduction.`,
  blockPromptTemplate: `Rewrite the following text block for the Institutional Infrastructure profile.

Original text:
{{originalText}}

Chapter context: {{chapterTitle}} (Block {{blockIndex}} of {{totalBlocksInChapter}})
Document part: Part {{partNumber}}

Requirements:
- Formal, regulatory tone suitable for institutional investors
- Maintain all factual content and technical accuracy
- Ensure 'No-Custody' principle is referenced where relevant
- No percentage claims about loss probability
- No use of 'Shield', 'Guarantee', 'Never fail', or 'Impossible'
- Notary references must position Notary as Trigger, not Access
- If this is an Executive Summary block, exclude technical details
- If this is a Pricing section, only include if Part 3

Provide your response in this exact format:
---REWRITE---
[Your rewritten text here]
---RATIONALE---
[Brief explanation of changes made and why]`,
  terminologyMap: {
    "Framework": "Infrastructure",
    "Liability Shield": "Defined Liability Process",
    "Protection": "Continuity Architecture",
    "Shield": "Governance Layer",
    "Safety Net": "Operational Redundancy",
    "Insurance": "Risk Architecture",
    "Backup Plan": "Contingency Protocol",
    "Trust": "Governance Vehicle",
    "Lock": "Access Control Mechanism",
  },
  allowedClaims: [
    "No-Custody architecture reduces operational attack surface",
    "Multisig governance provides distributed authorization",
    "Notary-triggered processes ensure verifiable succession",
    "Institutional-grade audit trails are maintained",
  ],
  forbiddenPatterns: [
    "\\d+%.*(?:loss|risk|reduction|probability)",
    "(?i)\\bshield\\b",
    "(?i)\\bguarantee[ds]?\\b",
    "(?i)\\bimpossible\\b",
    "(?i)\\bnever\\s+fail\\b",
    "(?i)\\bthreat\\b",
    "(?i)\\brisk[\\s-]*free\\b",
  ],
  glossary: {
    "DAIO": "Digital Asset Inheritance Orchestration — institutional governance infrastructure for digital asset continuity",
    "No-Custody": "Architectural principle ensuring the service provider never holds, controls, or has access to client assets",
    "Multisig": "Multi-signature authorization requiring multiple independent parties to approve transactions",
    "Notary Trigger": "Notarial event that initiates a defined governance process, without granting asset access",
    "Governance Map": "Structured representation of roles, assets, triggers, and policies in a continuity framework",
  },
  styleGuide: {
    maxSentenceLength: 35,
    preferActiveVoice: true,
    useHeadingsStyle: "numbered",
    paragraphMaxWords: 200,
  },
};
