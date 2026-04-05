// ═══════════════════════════════════════════════════════════════
// DAIO Template Generator — Core Type Definitions
// Maps all 21 templates across 9 operational phases
// ═══════════════════════════════════════════════════════════════

export type Language = "en" | "de";

export type PhaseId =
  | "client-acquisition"
  | "asset-discovery"
  | "container-creation"
  | "legacy-proof"
  | "transfer-gate"
  | "sentinel"
  | "activation"
  | "completion"
  | "compliance";

export interface PhaseDefinition {
  id: PhaseId;
  number: number;
  templates: TemplateId[];
}

export type TemplateId =
  | "initial-consultation"
  | "onboarding-checklist"
  | "expectation-management"
  | "data-protection-consent"
  | "digital-asset-inventory"
  | "wallet-categorization"
  | "exchange-account-doc"
  | "container-structure"
  | "heir-profile"
  | "digital-will"
  | "proof-creation-checklist"
  | "proof-certificate"
  | "transfer-gate-matrix"
  | "notary-confirmation"
  | "sentinel-configuration"
  | "escalation-path"
  | "activation-communication"
  | "completion-checklist"
  | "satisfaction-survey"
  | "audit-trail-entry"
  | "document-retention-policy";

export type TemplateStatus = "not-started" | "in-progress" | "completed" | "locked";

export interface TemplateState {
  id: TemplateId;
  status: TemplateStatus;
  completedAt?: string;
  data: Record<string, unknown>;
}

// ─── Phase 1: Client Acquisition ────────────────────────────

export interface InitialConsultationData {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  date: string;
  consultant: string;
  estimatedTotalAssets: number;
  digitalAssetProportion: number;
  existingAssets: {
    cryptocurrencies: boolean;
    nfts: boolean;
    tokenizedAssets: boolean;
    cloudAssets: boolean;
  };
  maritalStatus: string;
  childrenCount: number;
  existingArrangements: {
    will: boolean;
    inheritanceContract: boolean;
    livingWill: boolean;
    powerOfAttorney: boolean;
  };
  custodyMethod: string;
  documentationStatus: string;
  primaryGoals: string;
  desiredServices: string;
  timeframe: string;
}

export interface OnboardingChecklistData {
  clientName: string;
  clientId: string;
  contactPerson: string;
  startDate: string;
  expectedEndDate: string;
  phase1: {
    consultingAgreement: boolean;
    dataProtectionConsent: boolean;
    powersOfAttorney: boolean;
    goalAgreement: boolean;
  };
  phase2: {
    questionnaireComplete: boolean;
    inventoryCreated: boolean;
    walletCategorization: boolean;
    exchangeDocumentation: boolean;
    onChainAnalysis: boolean;
  };
  phase3: {
    containerStructure: boolean;
    heirProfiles: boolean;
    successionConditions: boolean;
    digitalWill: boolean;
    keyManagement: boolean;
  };
  phase4: {
    legacyProof: boolean;
    validationDoc: boolean;
    qualityCheck: boolean;
    clientApproval: boolean;
    sentinelConfig: boolean;
  };
  completion: {
    documentationStored: boolean;
    followUpScheduled: boolean;
    clientFileClosed: boolean;
  };
  completionDate: string;
  totalDurationDays: number;
  processingTimeHours: number;
  specialNotes: string;
}

export interface ExpectationManagementData {
  clientName: string;
  consultantName: string;
  date: string;
  servicePackage: "BASIC" | "PROFESSIONAL" | "PREMIUM" | "INDIVIDUAL";
  containersToCreate: number;
  walletsToDocument: number;
  legacyProofValidation: boolean;
  sentinelSetupDuration: string;
  consultationHours: number;
  excludedServices: {
    legalAdvice: boolean;
    taxAdvice: boolean;
    smartContractImpl: boolean;
    forensicAnalysis: boolean;
    authorityCommunication: boolean;
  };
  processingTimeMaxDays: number;
  availabilityHours: string;
  escalationPath: string;
}

export interface DataProtectionConsentData {
  companyName: string;
  companyContact: string;
  dataProtectionOfficer: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  consentGiven: boolean;
  processingScopes: {
    personalData: boolean;
    maritalData: boolean;
    assetData: boolean;
    accessCredentials: boolean;
    communicationData: boolean;
    billingData: boolean;
  };
  purposes: {
    containerCreation: boolean;
    legacyProof: boolean;
    sentinelConfig: boolean;
    communication: boolean;
    documentation: boolean;
  };
  retentionPeriodYears: number;
  signatureDate: string;
}

// ─── Phase 2: Asset Discovery ───────────────────────────────

export interface CryptoAssetEntry {
  assetType: string;
  walletType: "HARDWARE" | "SOFTWARE" | "CUSTODY" | "EXCHANGE";
  walletAddress: string;
  approximateValueEur: number;
  acquisitionDate: string;
  specialFeatures: string;
  documented: boolean;
}

export interface NftAssetEntry {
  collectionName: string;
  tokenId: string;
  platform: string;
  approximateValueEur: number;
  contractAddress: string;
  nftType: string;
}

export interface CloudAccountEntry {
  serviceType: "EMAIL" | "SOCIAL" | "CLOUD" | "STREAMING" | "OTHER";
  platform: string;
  accountId: string;
  estimatedValueEur: number;
  accessType: "PASSWORD" | "MFA" | "OTHER";
  specialFeatures: string;
}

export interface TokenizedAssetEntry {
  assetType: string;
  tokenStandard: string;
  platform: string;
  tokenCount: number;
  approximateValueEur: number;
  specialFeatures: string;
}

export interface DigitalAssetInventoryData {
  clientName: string;
  inventoryNumber: string;
  consultantName: string;
  createdDate: string;
  lastModifiedDate: string;
  status: "ACTIVE" | "ARCHIVED";
  cryptocurrencies: CryptoAssetEntry[];
  nfts: NftAssetEntry[];
  cloudAccounts: CloudAccountEntry[];
  tokenizedAssets: TokenizedAssetEntry[];
  totalValueEur: number;
  walletAddressCount: number;
  exchangeAccountCount: number;
  nftAssetCount: number;
  cloudAccountCount: number;
  documentationStatus: "FULL" | "PARTIAL" | "NOT_STARTED";
  nextSteps: string;
}

export interface WalletEntry {
  walletId: string;
  category: "HIGH" | "MEDIUM" | "CUSTODY";
  keyType: "SEED" | "PRIVATE_KEY" | "MNEMONIC";
  platform: string;
  address: string;
  securityFeatures: {
    hardwareWallet: boolean;
    mfa: boolean;
    passwordProtected: boolean;
    hsm: boolean;
    coldStorage: boolean;
    multiSig: boolean;
  };
  accessType: "SINGLE" | "MULTI" | "THRESHOLD" | "TIME_LOCKED";
  documented: boolean;
  heirAccessConfigured: boolean;
  notes: string;
}

export interface WalletCategorizationData {
  clientName: string;
  date: string;
  consultantName: string;
  wallets: WalletEntry[];
}

export interface ExchangeAccountData {
  platformName: string;
  platformType: "CEX" | "DEX" | "STAKING" | "OTHER";
  website: string;
  jurisdiction: string;
  regulatoryStatus: "REGULATED" | "UNREGULATED" | "PARTIALLY";
  accountId: string;
  accountType: "INDIVIDUAL" | "JOINT" | "BUSINESS";
  primaryEmail: string;
  registeredSince: string;
  assets: Array<{ type: string; amount: number; valueEur: number }>;
  totalValueEur: number;
  twoFactorMethod: "SMS" | "HARDWARE_KEY" | "APP";
  backupCodesSecured: boolean;
  masterPasswordSecured: boolean;
  apiKeysAvailable: boolean;
  apiKeyCount: number;
  specialFunctions: {
    staking: boolean;
    lending: boolean;
    marginTrading: boolean;
    apiTrading: boolean;
    institutional: boolean;
  };
  kycStatus: "VERIFIED" | "LIMITED" | "PENDING";
  verificationLevel: "TIER1" | "TIER2" | "TIER3";
  insuredByPlatform: "YES" | "NO" | "UNKNOWN";
  inheritanceProcess: string;
  requiredDocuments: string;
  supportContact: string;
  estimatedProcessingWeeks: number;
  notes: string;
}

export interface ExchangeAccountDocData {
  clientName: string;
  date: string;
  consultantName: string;
  accounts: ExchangeAccountData[];
}

// ─── Phase 3: Container Creation ────────────────────────────

export interface HeirEntry {
  name: string;
  dateOfBirth: string;
  relationship: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  sharePercent: number;
  conditions: string;
}

export interface ContainerStructureData {
  containerId: string;
  createdOn: string;
  lastModified: string;
  version: string;
  status: "ACTIVE" | "LOCKED" | "ARCHIVED";
  ownerName: string;
  ownerDateOfBirth: string;
  ownerPlaceOfBirth: string;
  ownerAddress: string;
  ownerTaxId: string;
  ownerNationality: string;
  assetSummary: {
    walletCount: number;
    totalCryptoValueEur: number;
    btcAmount: string;
    ethAmount: string;
    nftCount: number;
    nftTotalValueEur: number;
    cloudAccountCount: number;
    otherDigitalAssets: string;
  };
  primaryHeir: HeirEntry;
  secondaryHeir: HeirEntry;
  additionalHeirs: HeirEntry[];
  primaryTrigger: string;
  secondaryTrigger: string;
  periodAfterTrigger: string;
  distributionInstructions: string;
  specialConditions: string;
  contacts: {
    primaryContact: { name: string; phone: string; email: string };
    secondaryContact: { name: string; phone: string; email: string };
    notary: { name: string; phone: string; email: string };
    lawyer: { name: string; phone: string; email: string };
    taxAdvisor: { name: string; phone: string; email: string };
  };
  containerHash: string;
  previousHash: string;
  validatorId: string;
  legacyProofId: string;
  nextValidationDate: string;
}

export interface HeirProfileData {
  assetOwner: string;
  heirNumber: number;
  profileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  currentAddress: string;
  phone: string;
  email: string;
  relationshipType: string;
  relationshipSince: string;
  entitlementType: "PRIMARY" | "SECONDARY" | "CONDITIONAL";
  sharePercent: number;
  prerequisites: string;
  preferredContactMethod: "PHONE" | "EMAIL" | "LETTER";
  alternativeContactMethod: string;
  isMinor: boolean;
  underGuardianship: boolean;
  abroad: boolean;
  identityProofType: string;
  identityProofNumber: string;
  identityProofDate: string;
  relationshipProof: string;
  bankName: string;
  iban: string;
  specialWishes: string;
  signatureDate: string;
}

export interface DigitalWillData {
  assetOwner: string;
  birthDate: string;
  residenceAddress: string;
  willDate: string;
  containerReference: string;
  formalWillDate: string;
  btcInstructions: string;
  ethInstructions: string;
  nftInstructions: string;
  otherAssetInstructions: string;
  estateAdministrator: string;
  costPaymentMethod: string;
  lifetimeGifts: "NOT" | "ACCORDINGLY" | "OTHER";
  signatureDate: string;
  signatureLocation: string;
}

// ─── Phase 4: Legacy Proof ──────────────────────────────────

export interface ProofCreationChecklistData {
  containerId: string;
  clientName: string;
  consultantName: string;
  date: string;
  identityValidation: {
    identityProofVerified: boolean;
    proofType: string;
    proofNumber: string;
    issueDate: string;
    validityDate: string;
    photoVerified: boolean;
    addressVerified: boolean;
    signatureDocumented: boolean;
  };
  heirValidation: {
    allHeirsIdentified: boolean;
    relationshipProofs: boolean;
    birthCertificates: boolean;
    marriageCertificates: boolean;
    deathCertificates: boolean;
    identityProofsCollected: boolean;
    entitlementDocumented: boolean;
  };
  assetValidation: {
    allAssetsVerified: boolean;
    walletAddressesConfirmed: boolean;
    balancesDocumented: boolean;
    balanceDate: string;
    ownershipProofs: boolean;
    exchangeStatementsConfirmed: boolean;
  };
  legalBasis: {
    willReferenced: boolean;
    powersDocumented: boolean;
    restrictionsIdentified: boolean;
    internationalChecked: boolean;
  };
  technicalValidation: {
    encryptionActivated: boolean;
    keyManagementDocumented: boolean;
    accessRightsConfigured: boolean;
    integrityHashCreated: boolean;
  };
  documentation: {
    proofCertificateCreated: boolean;
    validationReportGenerated: boolean;
    containerUpdated: boolean;
    metadataArchived: boolean;
  };
  overallAssessment: "FULLY_VALIDATED" | "PARTIALLY_VALIDATED" | "NOT_VALIDATED";
  assessmentReason: string;
  createdBy: string;
  checkedBy: string;
}

export interface ProofCertificateData {
  certificateNumber: string;
  issuanceDate: string;
  validUntil: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerDateOfBirth: string;
  ownerResidence: string;
  containerId: string;
  containerCreationDate: string;
  documentedAssetCount: number;
  heirCount: number;
  validationPoints: {
    identityVerified: boolean;
    heirsDocumented: boolean;
    assetsVerified: boolean;
    legalBasisChecked: boolean;
    technicalIntegrityConfirmed: boolean;
    documentationValidated: boolean;
  };
  containerHash: string;
  validatorId: string;
  checksum: string;
  consultantName: string;
  qualifications: string;
}

// ─── Phase 5: Transfer Gate ─────────────────────────────────

export interface TransferGateMatrixData {
  validFrom: string;
  version: string;
  approvedBy: string;
  approvedOn: string;
  classALimit: number;
  classBLowerLimit: number;
  classBUpperLimit: number;
  classCLowerLimit: number;
  classCUpperLimit: number;
  classDLowerLimit: number;
  classADailyLimit: number;
  classBDailyLimit: number;
  classCDailyLimit: number;
  level1Config: { description: string };
  level2Config: { approver: string; timeLimit: number; documentation: boolean };
  level3Config: { approver1: string; approver2: string; timeLimit: number };
  level4Config: { participants: string; timeLimit: number };
  criticalTransferLevel: number;
  criticalCriteria: string;
  notaryRequired: boolean;
}

export interface NotaryConfirmationData {
  transferId: string;
  containerId: string;
  requestDate: string;
  notaryName: string;
  officeAddress: string;
  officialSeat: string;
  ownerName: string;
  ownerDateOfBirth: string;
  ownerDeathDate: string;
  heirName: string;
  heirDateOfBirth: string;
  inheritanceDocDate: string;
  assetDescription: string;
  walletAddress: string;
  estimatedValueEur: number;
  legalBasis: "WILL" | "INHERITANCE_CONTRACT" | "LEGAL_INHERITANCE";
  legalBasisDate: string;
  identityVerified: boolean;
  entitlementProven: boolean;
  noObstaclesKnown: boolean;
  transferCanExecute: boolean;
  notaryId: string;
  feesEur: number;
}

// ─── Phase 6: Sentinel ──────────────────────────────────────

export interface SentinelConfigurationData {
  containerId: string;
  clientName: string;
  configuredBy: string;
  date: string;
  monitoringMode: "ACTIVE" | "PAUSED" | "TEST";
  primaryTrigger: {
    type: string;
    sources: {
      deathRegisters: boolean;
      newsMonitoring: boolean;
      insuranceNotification: boolean;
      familyNotification: boolean;
    };
    confirmationMode: "AUTOMATIC" | "MANUAL";
    requiredSources: number;
  };
  secondaryTriggers: Array<{
    type: string;
    definition: string;
    trigger: string;
  }>;
  notifications: {
    level1: { recipients: string; channel: string; timeframe: string };
    level2: { recipients: string; channel: string; timeframe: string };
    level3: { recipients: string; channel: string; timeframe: string };
    level4: { action: string; timeframe: string };
  };
  timeframes: {
    confirmationWindowDays: number;
    waitBeforeLevel2Hours: number;
    waitBeforeLevel3Days: number;
    waitBeforeLevel4Days: number;
  };
  activatedOn: string;
  activatedBy: string;
  nextReview: string;
  configConfirmed: boolean;
  testRunCompleted: boolean;
  contactsInformed: boolean;
}

export interface EscalationPathData {
  containerId: string;
  clientName: string;
  validFrom: string;
  levels: Array<{
    level: number;
    name: string;
    trigger: string;
    responsibility: string;
    responseTime: string;
    channels: string;
    action: string;
  }>;
  contacts: Array<{
    role: string;
    name: string;
    phone: string;
    email: string;
    availability: string;
  }>;
  exceptions: string;
}

// ─── Phase 7: Activation ────────────────────────────────────

export interface ActivationCommunicationData {
  date: string;
  recipientName: string;
  recipientAddress: string;
  assetOwner: string;
  eventDate: string;
  eventType: string;
  relationship: string;
  containerId: string;
  consultantName: string;
  consultantPhone: string;
  consultantEmail: string;
  officeHours: string;
}

// ─── Phase 8: Completion ────────────────────────────────────

export interface CompletionChecklistData {
  caseId: string;
  clientName: string;
  completedOn: string;
  transfers: Array<{
    description: string;
    transferDate: string;
    confirmed: boolean;
  }>;
  transferConfirmationsReceived: boolean;
  blockchainTransactionsVerified: boolean;
  receiptFromHeirs: boolean;
  caseFileCompiled: boolean;
  documentsDigitized: boolean;
  integrityHash: boolean;
  caseFileArchived: boolean;
  retentionUntil: string;
  finalStatementCreated: boolean;
  openReceivablesCalculated: boolean;
  finalInvoiceSent: boolean;
  paymentTracked: boolean;
  heirFeedback: boolean;
  lessonsDocumented: boolean;
  improvementsRecorded: boolean;
  processAdjustments: boolean;
  containerArchived: boolean;
  sentinelDeactivated: boolean;
  legacyProofUpdated: boolean;
  statisticsUpdated: boolean;
  thankYouEmail: boolean;
  internalComm: boolean;
  stakeholdersInformed: boolean;
  completedBy: string;
  checkedBy: string;
  checkedOn: string;
  specialNotes: string;
}

export interface SatisfactionSurveyData {
  recipientName: string;
  overallSatisfaction: number;
  communicationRating: number;
  communicationSuggestions: string;
  competenceRating: number;
  competenceSuggestions: string;
  transparencyRating: number;
  transparencySuggestions: string;
  speedRating: number;
  speedSuggestions: string;
  wouldRecommend: "YES_DEFINITELY" | "PROBABLY" | "UNDECIDED" | "PROBABLY_NOT" | "NO";
  additionalComments: string;
  date: string;
}

// ─── Phase 9: Compliance ────────────────────────────────────

export interface AuditTrailEntryData {
  entryId: string;
  timestamp: string;
  actionType: "TRANSFER" | "CONFIG_CHANGE" | "ACCESS" | "EXCEPTION";
  userId: string;
  userRole: "CONSULTANT" | "ADMIN" | "CHECKER" | "OTHER";
  userName: string;
  actionSubType: string;
  affectedObject: string;
  description: string;
  stateBefore: string;
  stateAfter: string;
  changedFields: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  geolocation: string;
  entryHash: string;
  digitalSignature: string;
  verified: boolean;
  reason: string;
  approvalRequired: boolean;
  approvalId: string;
}

export interface RetentionClassEntry {
  className: string;
  priority: string;
  documentTypes: string;
  retentionPeriod: string;
  reason: string;
  procedureOnExpiry: string;
}

export interface DocumentRetentionPolicyData {
  validFrom: string;
  version: string;
  approvedBy: string;
  classes: RetentionClassEntry[];
  exceptions: {
    legalDisputes: string;
    authorityInvestigations: string;
    dataProtectionRequests: string;
  };
  responsibilities: {
    retentionManager: string;
    deletionResponsible: string;
    complianceControl: string;
  };
}

// ─── Master state for the whole generator ───────────────────

export interface GeneratorState {
  language: Language;
  currentPhase: PhaseId;
  currentTemplate: TemplateId | null;
  templates: Record<TemplateId, TemplateState>;
}
