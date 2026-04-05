/** Global terminology mappings shared across all profiles */
export const GLOBAL_TERMINOLOGY: Record<string, string> = {
  "Framework": "Infrastructure",
  "Liability Shield": "Defined Liability Process",
  "Protection": "Continuity Architecture",
  "Shield": "Governance Layer",
  "Safety Net": "Operational Redundancy",
  "Insurance": "Risk Architecture",
  "Backup Plan": "Contingency Protocol",
};

/** Terms that are always forbidden regardless of profile */
export const FORBIDDEN_TERMS = [
  "shield",
  "guarantee",
  "guaranteed",
  "guarantees",
  "impossible",
  "never fail",
  "risk-free",
  "risk free",
  "foolproof",
  "bulletproof",
  "fail-safe",
  "zero risk",
];

/** Terms that must appear in any DAIO document */
export const REQUIRED_TERMS = [
  "no-custody",
  "governance",
  "multisig",
];
