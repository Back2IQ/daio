/**
 * MiCA Compliance Logic.
 * Automated compliance checks, jurisdiction detection,
 * document generation scaffolds, and actionable compliance items.
 */

// ─── Types ───────────────────────────────────────────────────────

export type Jurisdiction = 'EU' | 'DE' | 'AT' | 'CH' | 'US' | 'UK' | 'OTHER';

export type ComplianceCategory =
  | 'mica'           // MiCA (EU Crypto-Assets Regulation)
  | 'bgh'            // BGH III ZR 183/17 (German Digital Inheritance)
  | 'gdpr'           // GDPR Data Protection
  | 'aml'            // Anti-Money Laundering
  | 'tax'            // Tax reporting
  | 'inheritance';   // Inheritance law compliance

export type ComplianceSeverity = 'critical' | 'warning' | 'info' | 'ok';

export interface ComplianceCheck {
  id: string;
  category: ComplianceCategory;
  title: string;
  description: string;
  severity: ComplianceSeverity;
  passed: boolean;
  actionRequired?: string;
  documentLink?: string;
  jurisdictions: Jurisdiction[];
}

export interface ComplianceReport {
  generatedAt: number;
  jurisdiction: Jurisdiction;
  overallStatus: 'compliant' | 'action_required' | 'non_compliant';
  checks: ComplianceCheck[];
  score: number; // 0-100
}

export interface ComplianceDocument {
  id: string;
  title: string;
  category: ComplianceCategory;
  jurisdiction: Jurisdiction;
  generatedAt: number;
  content: string;
  format: 'text' | 'html';
}

// ─── Compliance checks ──────────────────────────────────────────

interface CheckInput {
  hasBeneficiaries: boolean;
  beneficiaryCount: number;
  hasGuardians: boolean;
  guardianCount: number;
  hasNotary: boolean;
  dmsEnabled: boolean;
  hasInheritanceContainer: boolean;
  inheritanceContainerLevel: number;
  keyFragmentsDistributed: boolean;
  encryptionEnabled: boolean;
  daiScore: number;
  totalValueUSD: number;
}

export function runComplianceChecks(
  input: CheckInput,
  jurisdiction: Jurisdiction
): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // ── MiCA Checks ────────────────────────────────────────────────
  checks.push({
    id: 'mica-self-custody',
    category: 'mica',
    title: 'Self-Custody Architecture',
    description: 'Wallet operates as non-custodial. Private keys never leave the user device. (Architectural claim — not dynamically verified)',
    severity: 'info',
    passed: true,
    jurisdictions: ['EU', 'DE', 'AT'],
  });

  checks.push({
    id: 'mica-key-management',
    category: 'mica',
    title: 'Cryptographic Key Management',
    description: 'Keys derived via BIP-39/32, encrypted with AES-256-GCM at rest.',
    severity: input.encryptionEnabled ? 'ok' : 'critical',
    passed: input.encryptionEnabled,
    actionRequired: input.encryptionEnabled ? undefined : 'Enable wallet encryption',
    jurisdictions: ['EU', 'DE', 'AT'],
  });

  if (input.totalValueUSD > 1000) {
    checks.push({
      id: 'mica-transfer-limits',
      category: 'mica',
      title: 'Transfer Monitoring',
      description: 'MiCA Art. 76: transfers above €1,000 require sender/recipient identification.',
      severity: 'info',
      passed: true,
      actionRequired: 'Ensure beneficiary addresses are documented in Inheritance Container',
      jurisdictions: ['EU', 'DE', 'AT'],
    });
  }

  // ── BGH Digital Inheritance ────────────────────────────────────
  checks.push({
    id: 'bgh-inheritance-plan',
    category: 'bgh',
    title: 'Digital Inheritance Plan',
    description: 'BGH III ZR 183/17 mandates digital assets are inheritable.',
    severity: input.hasBeneficiaries ? 'ok' : 'warning',
    passed: input.hasBeneficiaries,
    actionRequired: input.hasBeneficiaries ? undefined : 'Designate at least one heir in Beneficiaries',
    jurisdictions: ['DE'],
  });

  checks.push({
    id: 'bgh-access-architecture',
    category: 'bgh',
    title: 'Access Architecture Documented',
    description: 'Access methods and recovery procedures must be documented.',
    severity: input.hasInheritanceContainer ? 'ok' : 'warning',
    passed: input.hasInheritanceContainer,
    actionRequired: input.hasInheritanceContainer
      ? undefined
      : 'Create an Inheritance Container (DAIO Shield → Inheritance Container)',
    jurisdictions: ['DE'],
  });

  checks.push({
    id: 'bgh-key-distribution',
    category: 'bgh',
    title: 'Shamir Key Fragment Distribution',
    description: 'Key fragments must be distributed to designated parties.',
    severity: input.keyFragmentsDistributed ? 'ok' : 'warning',
    passed: input.keyFragmentsDistributed,
    actionRequired: input.keyFragmentsDistributed
      ? undefined
      : 'Generate and distribute key fragments',
    jurisdictions: ['DE', 'AT', 'CH'],
  });

  // ── GDPR ───────────────────────────────────────────────────────
  checks.push({
    id: 'gdpr-data-encryption',
    category: 'gdpr',
    title: 'Data Encryption at Rest',
    description: input.encryptionEnabled
      ? 'All personal data encrypted with AES-256-GCM (PBKDF2 600k iterations).'
      : 'Wallet encryption is not verified. Ensure your wallet is password-protected.',
    severity: input.encryptionEnabled ? 'ok' : 'critical',
    passed: input.encryptionEnabled,
    actionRequired: input.encryptionEnabled ? undefined : 'Set a wallet password to enable encryption',
    jurisdictions: ['EU', 'DE', 'AT'],
  });

  checks.push({
    id: 'gdpr-data-minimization',
    category: 'gdpr',
    title: 'Data Minimization',
    description: 'No personal data transmitted to external servers. (Architectural claim — not dynamically verified)',
    severity: 'info',
    passed: true,
    jurisdictions: ['EU', 'DE', 'AT'],
  });

  // ── Dead Man's Switch ──────────────────────────────────────────
  checks.push({
    id: 'inheritance-dms',
    category: 'inheritance',
    title: "Dead Man's Switch Active",
    description: 'Automated inactivity detection with escalation protocol.',
    severity: input.dmsEnabled ? 'ok' : 'warning',
    passed: input.dmsEnabled,
    actionRequired: input.dmsEnabled
      ? undefined
      : "Enable the Dead Man's Switch (DAIO Shield → DMS)",
    jurisdictions: ['EU', 'DE', 'AT', 'CH', 'US', 'UK', 'OTHER'],
  });

  // ── Guardian/Notary ────────────────────────────────────────────
  if (['DE', 'AT', 'CH'].includes(jurisdiction)) {
    checks.push({
      id: 'inheritance-notary',
      category: 'inheritance',
      title: 'Notary Designation',
      description: 'A notary should be designated for legal verification of death certificate.',
      severity: input.hasNotary ? 'ok' : 'info',
      passed: input.hasNotary,
      actionRequired: input.hasNotary ? undefined : 'Consider adding a notary beneficiary',
      jurisdictions: ['DE', 'AT', 'CH'],
    });
  }

  checks.push({
    id: 'inheritance-guardians',
    category: 'inheritance',
    title: 'Guardian Appointment',
    description: 'Guardians provide oversight and can initiate emergency/recovery protocols.',
    severity: input.hasGuardians ? 'ok' : 'info',
    passed: input.hasGuardians,
    actionRequired: input.hasGuardians ? undefined : 'Appoint at least one guardian',
    jurisdictions: ['EU', 'DE', 'AT', 'CH', 'US', 'UK', 'OTHER'],
  });

  // Filter by jurisdiction
  return checks.filter(
    (c) => c.jurisdictions.includes(jurisdiction) || c.jurisdictions.includes('OTHER')
  );
}

// ─── Compliance score ────────────────────────────────────────────

export function calculateComplianceScore(checks: ComplianceCheck[]): number {
  if (checks.length === 0) return 100;
  const passed = checks.filter((c) => c.passed).length;
  return Math.min(100, Math.max(0, Math.round((passed / checks.length) * 100)));
}

// ─── Report generation ──────────────────────────────────────────

export function generateComplianceReport(
  input: CheckInput,
  jurisdiction: Jurisdiction
): ComplianceReport {
  const checks = runComplianceChecks(input, jurisdiction);
  const score = calculateComplianceScore(checks);

  const criticalFailures = checks.filter((c) => !c.passed && c.severity === 'critical');
  const warningFailures = checks.filter((c) => !c.passed && c.severity === 'warning');

  let overallStatus: ComplianceReport['overallStatus'];
  if (criticalFailures.length > 0) overallStatus = 'non_compliant';
  else if (warningFailures.length > 0) overallStatus = 'action_required';
  else overallStatus = 'compliant';

  return {
    generatedAt: Date.now(),
    jurisdiction,
    overallStatus,
    checks,
    score,
  };
}

// ─── Document generation ─────────────────────────────────────────

export function generateComplianceDocument(
  report: ComplianceReport,
  walletAddress: string
): ComplianceDocument {
  const dateStr = new Date(report.generatedAt).toISOString().split('T')[0];
  const actionItems = report.checks
    .filter((c) => !c.passed && c.actionRequired)
    .map((c, i) => `${i + 1}. [${c.category.toUpperCase()}] ${c.title}: ${c.actionRequired}`)
    .join('\n');

  const content = [
    `DAIO WALLET COMPLIANCE REPORT`,
    `Generated: ${dateStr}`,
    `Jurisdiction: ${report.jurisdiction}`,
    `Wallet: ${walletAddress}`,
    `Overall Status: ${report.overallStatus.toUpperCase().replace('_', ' ')}`,
    `Compliance Score: ${report.score}/100`,
    ``,
    `─── CHECKS ─────────────────────`,
    ...report.checks.map(
      (c) => `[${c.passed ? 'PASS' : 'FAIL'}] ${c.title} (${c.category})`
    ),
    ``,
    ...(actionItems
      ? [`─── ACTION ITEMS ───────────────`, actionItems]
      : [`No action items required.`]),
    ``,
    `─── DISCLAIMER ─────────────────`,
    `This report is generated automatically and does not constitute legal advice.`,
    `Consult a qualified legal professional for compliance requirements specific to your jurisdiction.`,
  ].join('\n');

  return {
    id: crypto.randomUUID(),
    title: `Compliance Report — ${dateStr}`,
    category: 'mica',
    jurisdiction: report.jurisdiction,
    generatedAt: report.generatedAt,
    content,
    format: 'text',
  };
}

// ─── Jurisdiction helpers ────────────────────────────────────────

export function getJurisdictionLabel(j: Jurisdiction): string {
  switch (j) {
    case 'EU': return 'European Union';
    case 'DE': return 'Germany (DE)';
    case 'AT': return 'Austria (AT)';
    case 'CH': return 'Switzerland (CH)';
    case 'US': return 'United States';
    case 'UK': return 'United Kingdom';
    case 'OTHER': return 'Other';
  }
}

export function getJurisdictions(): { value: Jurisdiction; label: string }[] {
  return [
    { value: 'DE', label: 'Germany (DE)' },
    { value: 'AT', label: 'Austria (AT)' },
    { value: 'CH', label: 'Switzerland (CH)' },
    { value: 'EU', label: 'European Union (General)' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'OTHER', label: 'Other Jurisdiction' },
  ];
}

export function getSeverityColor(s: ComplianceSeverity): string {
  switch (s) {
    case 'critical': return 'text-red-700 bg-red-50 border-red-200';
    case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'info': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'ok': return 'text-green-700 bg-green-50 border-green-200';
  }
}
