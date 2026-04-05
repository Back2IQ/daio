import type { RewriteProfile } from "../../types";

export const hnwiProfile: RewriteProfile = {
  id: "hnwi",
  name: "HNWI Governance",
  shortName: "HNWI / Entrepreneur",
  description: "Strategic governance document for high-net-worth individuals and entrepreneurs",
  targetAudience: "Entrepreneurs, HNWIs, family patriarchs/matriarchs with digital asset portfolios",
  tone: {
    formality: "semi-formal",
    approach: "strategic",
    keywords: [
      "legacy architecture",
      "wealth continuity",
      "strategic governance",
      "family governance",
      "generational transfer",
      "entrepreneurial continuity",
      "no-custody principle",
    ],
    avoidWords: [
      "shield",
      "protect",
      "guarantee",
      "never fail",
      "impossible",
      "threat",
      "risk-free",
      "cheap",
      "basic",
    ],
  },
  systemPrompt: `You are a governance document specialist rewriting content for high-net-worth individuals and entrepreneurs. Your tone is strategic and legacy-focused, speaking to people who think in terms of generational wealth, family governance, and business continuity. Use language that resonates with decision-makers who value sovereignty over their assets. Emphasize the No-Custody principle as a matter of personal control, not just compliance. Never make percentage claims about risk reduction.`,
  blockPromptTemplate: `Rewrite the following text block for the HNWI Governance profile.

Original text:
{{originalText}}

Chapter context: {{chapterTitle}} (Block {{blockIndex}} of {{totalBlocksInChapter}})
Document part: Part {{partNumber}}

Requirements:
- Strategic, legacy-focused tone suitable for HNWIs and entrepreneurs
- Frame governance as empowerment, not restriction
- Emphasize personal sovereignty and family continuity
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
    "Framework": "Protocol",
    "Liability Shield": "Defined Liability Process",
    "Protection": "Continuity Design",
    "Shield": "Governance Architecture",
    "Safety Net": "Strategic Redundancy",
    "Insurance": "Continuity Design",
    "Backup Plan": "Succession Architecture",
    "Corporate": "Entrepreneurial",
    "Lock": "Sovereign Access Design",
  },
  allowedClaims: [
    "No-Custody architecture ensures personal sovereignty over digital assets",
    "Multisig governance distributes decision authority across trusted parties",
    "Legacy architecture provides generational continuity for digital wealth",
    "Notary-triggered processes maintain family governance integrity",
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
    "DAIO": "Digital Asset Inheritance Orchestration — strategic governance architecture for your digital legacy",
    "No-Custody": "Your assets remain under your control at all times. No third party ever holds or accesses them.",
    "Multisig": "Multiple authorized parties must independently approve any significant action",
    "Notary Trigger": "A notarial event that starts a defined succession process — the notary triggers, but never accesses",
    "Legacy Architecture": "The complete governance design ensuring your digital wealth transfers according to your wishes",
  },
  styleGuide: {
    maxSentenceLength: 30,
    preferActiveVoice: true,
    useHeadingsStyle: "hierarchical",
    paragraphMaxWords: 180,
  },
};
