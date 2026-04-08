import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────────

export type DMSStatus = "inactive" | "active" | "warning_1" | "warning_2" | "warning_3" | "triggered";

export interface DeadManSwitch {
  enabled: boolean;
  intervalMonths: 3 | 6 | 12;
  lastCheckIn: number;
  status: DMSStatus;
  warningsSent: number;
  nextCheckIn: number;
  triggerDate?: number;
}

export interface DMSConfig {
  stage1Days: number;
  stage2Days: number;
  stage3Days: number;
  enabled: boolean;
  lastLogin: number;
  nextWarning: number;
  status: "active" | "warning" | "escalation" | "critical" | "inactive";
}

export interface InheritanceContainer {
  level: 1 | 2 | 3;
  version: number;
  lastUpdated: number;
  assetInventory: string;
  accessArchitecture: string;
  heirDesignation: string;
  legacyContext: string;
  platformInstructions: string;
  professionalContacts: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "heir" | "guardian" | "notary";
  notified: boolean;
}

export interface KeyFragment {
  id: string;
  holder: string;
  type: "heir" | "guardian" | "notary" | "self";
  status: "distributed" | "pending" | "activated";
  encrypted: boolean;
}

export interface EmergencyProtocol {
  enabled: boolean;
  lastTriggered?: number;
  reason?: string;
  authorizedGuardians: string[];
}

export interface TransferGateStep {
  step: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  status: "pending" | "active" | "done";
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  type: "info" | "warning" | "critical" | "success";
}

// ── Store ────────────────────────────────────────────────────────

interface GovernanceState {
  // Dead Man's Switch
  deadManSwitch: DeadManSwitch;
  dmsConfig: DMSConfig;
  checkIn: () => void;
  updateDMSConfig: (patch: Partial<DMSConfig>) => void;
  toggleDMS: (enabled: boolean) => void;

  // Inheritance Container
  inheritanceContainer: InheritanceContainer;
  setInheritanceContainer: (patch: Partial<InheritanceContainer>) => void;

  // Beneficiaries
  beneficiaries: Beneficiary[];
  addBeneficiary: (b: Omit<Beneficiary, "id" | "notified">) => void;
  removeBeneficiary: (id: string) => void;

  // Key Fragments
  keyFragments: KeyFragment[];
  generateKeyFragments: () => void;

  // Emergency
  emergencyProtocol: EmergencyProtocol;
  triggerEmergency: (reason: string) => void;

  // Transfer Gate
  transferGateSteps: TransferGateStep[];

  // Audit
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;

  // DAIO Score
  getDaiScore: () => number;
  getDaiScoreBreakdown: () => { label: string; score: number; max: number }[];

  // DMS helpers
  getTimeUntilTrigger: () => string;
  getDmsStatusColor: () => string;
}

const DEFAULT_DMS: DeadManSwitch = {
  enabled: false,
  intervalMonths: 6,
  lastCheckIn: Date.now(),
  status: "inactive",
  warningsSent: 0,
  nextCheckIn: Date.now() + 180 * 24 * 60 * 60 * 1000,
};

const DEFAULT_DMS_CONFIG: DMSConfig = {
  stage1Days: 90,
  stage2Days: 150,
  stage3Days: 300,
  enabled: false,
  lastLogin: Date.now(),
  nextWarning: 0,
  status: "inactive",
};

const DEFAULT_INHERITANCE: InheritanceContainer = {
  level: 1,
  version: 0,
  lastUpdated: 0,
  assetInventory: "",
  accessArchitecture: "",
  heirDesignation: "",
  legacyContext: "",
  platformInstructions: "",
  professionalContacts: "",
};

const DEFAULT_TRANSFER_STEPS: TransferGateStep[] = [
  { step: 1, label: "Authorization", description: "DMS trigger verified, guardians notified", status: "pending" },
  { step: 2, label: "Verification", description: "Identity verification of heir(s)", status: "pending" },
  { step: 3, label: "Preparation", description: "Key fragments collected, threshold met", status: "pending" },
  { step: 4, label: "Execution", description: "Assets unlocked, transfer initiated", status: "pending" },
  { step: 5, label: "Completion", description: "Transfer confirmed, audit sealed", status: "pending" },
];

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      // ── Dead Man's Switch ──────────────────────────────
      deadManSwitch: DEFAULT_DMS,
      dmsConfig: DEFAULT_DMS_CONFIG,

      checkIn: () => {
        const { deadManSwitch: dms } = get();
        const nextCheckIn = Date.now() + dms.intervalMonths * 30 * 24 * 60 * 60 * 1000;
        set({
          deadManSwitch: {
            ...dms,
            lastCheckIn: Date.now(),
            status: "active",
            warningsSent: 0,
            nextCheckIn,
            triggerDate: undefined,
          },
        });
        get().addAuditEntry({ action: "DMS Check-In", details: "Proof of life confirmed.", type: "success" });
      },

      toggleDMS: (enabled) => {
        const { deadManSwitch: dms, dmsConfig } = get();
        const nextCheckIn = Date.now() + dms.intervalMonths * 30 * 24 * 60 * 60 * 1000;
        set({
          deadManSwitch: { ...dms, enabled, status: enabled ? "active" : "inactive", lastCheckIn: Date.now(), nextCheckIn },
          dmsConfig: { ...dmsConfig, enabled },
        });
        get().addAuditEntry({
          action: enabled ? "DMS Enabled" : "DMS Disabled",
          details: `Succession Sentinel ${enabled ? "activated" : "deactivated"}.`,
          type: "info",
        });
      },

      updateDMSConfig: (patch) => set((s) => ({ dmsConfig: { ...s.dmsConfig, ...patch } })),

      // ── Inheritance Container ──────────────────────────
      inheritanceContainer: DEFAULT_INHERITANCE,

      setInheritanceContainer: (patch) => {
        set((s) => {
          const updated = { ...s.inheritanceContainer, ...patch, lastUpdated: Date.now(), version: s.inheritanceContainer.version + 1 };
          // Auto-calculate level
          const l1 = !!(updated.assetInventory && updated.accessArchitecture && updated.heirDesignation);
          const l2 = l1 && !!(updated.legacyContext && updated.platformInstructions);
          const l3 = l2 && !!updated.professionalContacts;
          updated.level = l3 ? 3 : l2 ? 2 : 1;
          return { inheritanceContainer: updated };
        });
        get().addAuditEntry({ action: "Inheritance Container Updated", details: `Version ${get().inheritanceContainer.version}, Level ${get().inheritanceContainer.level}`, type: "info" });
      },

      // ── Beneficiaries ──────────────────────────────────
      beneficiaries: [],

      addBeneficiary: (b) => {
        const newB: Beneficiary = { ...b, id: crypto.randomUUID(), notified: false };
        set((s) => ({ beneficiaries: [...s.beneficiaries, newB] }));
        get().addAuditEntry({ action: "Beneficiary Added", details: `${newB.name} (${newB.role})`, type: "info" });
      },

      removeBeneficiary: (id) => {
        const b = get().beneficiaries.find((x) => x.id === id);
        set((s) => ({ beneficiaries: s.beneficiaries.filter((x) => x.id !== id) }));
        if (b) get().addAuditEntry({ action: "Beneficiary Removed", details: `${b.name} (${b.role})`, type: "warning" });
      },

      // ── Key Fragments ──────────────────────────────────
      keyFragments: [],

      generateKeyFragments: () => {
        const { beneficiaries } = get();
        const parts = 1 + beneficiaries.length;
        const threshold = Math.max(2, Math.ceil(parts / 2) + 1);

        // Generate placeholder fragments (real Shamir would need actual secret)
        const fragments: KeyFragment[] = [
          { id: crypto.randomUUID(), holder: "Owner (Self)", type: "self", status: "distributed", encrypted: true },
          ...beneficiaries.map((b) => ({
            id: crypto.randomUUID(),
            holder: b.name,
            type: b.role as KeyFragment["type"],
            status: "pending" as const,
            encrypted: true,
          })),
        ];

        set({ keyFragments: fragments });
        get().addAuditEntry({
          action: "Key Fragments Generated",
          details: `${parts} fragments created, threshold ${threshold} required for reconstruction.`,
          type: "success",
        });
      },

      // ── Emergency ──────────────────────────────────────
      emergencyProtocol: { enabled: false, authorizedGuardians: [] },

      triggerEmergency: (reason) => {
        set((s) => ({
          emergencyProtocol: { ...s.emergencyProtocol, enabled: true, lastTriggered: Date.now(), reason },
        }));
        get().generateKeyFragments();
        get().addAuditEntry({
          action: "EMERGENCY ACTIVATED",
          details: `Reason: ${reason}. Keys regenerated, protocol engaged.`,
          type: "critical",
        });
      },

      // ── Transfer Gate ──────────────────────────────────
      transferGateSteps: DEFAULT_TRANSFER_STEPS,

      // ── Audit Trail ────────────────────────────────────
      auditTrail: [],

      addAuditEntry: (entry) =>
        set((s) => ({
          auditTrail: [{ ...entry, id: crypto.randomUUID(), timestamp: Date.now() }, ...s.auditTrail].slice(0, 1000),
        })),

      // ── DAIO Score ─────────────────────────────────────
      getDaiScore: () => {
        const s = get();
        let score = 0;

        // Inheritance Container (30)
        if (s.inheritanceContainer.lastUpdated > 0) score += 10;
        if (s.inheritanceContainer.level >= 2) score += 10;
        if (s.inheritanceContainer.level >= 3) score += 10;

        // DMS (20)
        if (s.deadManSwitch.status === "active") score += 20;
        else if (s.deadManSwitch.status === "warning_1") score += 15;
        else if (s.deadManSwitch.status === "warning_2") score += 10;
        else if (s.deadManSwitch.status === "warning_3") score += 5;

        // Fragments (20)
        if (s.keyFragments.length > 0) score += 20;

        // Beneficiaries (15)
        if (s.beneficiaries.length > 0) score += 5;
        if (s.beneficiaries.length >= 2) score += 5;
        if (s.beneficiaries.some((b) => b.role === "notary")) score += 5;

        // Emergency (10)
        if (s.emergencyProtocol.enabled) score += 10;

        // Biometric (5) — reserved
        return score;
      },

      getDaiScoreBreakdown: () => {
        const s = get();
        let ic = 0;
        if (s.inheritanceContainer.lastUpdated > 0) ic += 10;
        if (s.inheritanceContainer.level >= 2) ic += 10;
        if (s.inheritanceContainer.level >= 3) ic += 10;

        let dms = 0;
        if (s.deadManSwitch.status === "active") dms = 20;
        else if (s.deadManSwitch.status === "warning_1") dms = 15;
        else if (s.deadManSwitch.status === "warning_2") dms = 10;
        else if (s.deadManSwitch.status === "warning_3") dms = 5;

        const frag = s.keyFragments.length > 0 ? 20 : 0;

        let ben = 0;
        if (s.beneficiaries.length > 0) ben += 5;
        if (s.beneficiaries.length >= 2) ben += 5;
        if (s.beneficiaries.some((b) => b.role === "notary")) ben += 5;

        const emg = s.emergencyProtocol.enabled ? 10 : 0;

        return [
          { label: "Inheritance Container", score: ic, max: 30 },
          { label: "Succession Sentinel", score: dms, max: 20 },
          { label: "Key Fragments", score: frag, max: 20 },
          { label: "Beneficiaries", score: ben, max: 15 },
          { label: "Emergency Protocol", score: emg, max: 10 },
          { label: "Biometric (Future)", score: 0, max: 5 },
        ];
      },

      // ── DMS Helpers ────────────────────────────────────
      getTimeUntilTrigger: () => {
        const { deadManSwitch: dms } = get();
        if (!dms.enabled || dms.status === "inactive") return "Inactive";
        if (dms.status === "triggered") return "Triggered";
        const diff = dms.nextCheckIn - Date.now();
        if (diff <= 0) return "Overdue";
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        if (days > 0) return `${days}d remaining`;
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}h remaining`;
      },

      getDmsStatusColor: () => {
        const status = get().deadManSwitch.status;
        switch (status) {
          case "active": return "text-emerald-500";
          case "warning_1": return "text-amber-500";
          case "warning_2": return "text-orange-500";
          case "warning_3": return "text-red-500";
          case "triggered": return "text-red-700";
          default: return "text-muted-foreground";
        }
      },
    }),
    {
      name: "daio-governance",
      version: 1,
    }
  )
);
