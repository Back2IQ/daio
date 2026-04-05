import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type {
  GeneratorState,
  PhaseId,
  PhaseDefinition,
  TemplateId,
  TemplateStatus,
  Language,
} from "../types";
import { loadState, saveState, createInitialState } from "../utils/storage";

// ─── Phase definitions (source of truth) ────────────────────

export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    id: "client-acquisition",
    number: 1,
    templates: [
      "initial-consultation",
      "onboarding-checklist",
      "expectation-management",
      "data-protection-consent",
    ],
  },
  {
    id: "asset-discovery",
    number: 2,
    templates: [
      "digital-asset-inventory",
      "wallet-categorization",
      "exchange-account-doc",
    ],
  },
  {
    id: "container-creation",
    number: 3,
    templates: [
      "container-structure",
      "heir-profile",
      "digital-will",
    ],
  },
  {
    id: "legacy-proof",
    number: 4,
    templates: [
      "proof-creation-checklist",
      "proof-certificate",
    ],
  },
  {
    id: "transfer-gate",
    number: 5,
    templates: [
      "transfer-gate-matrix",
      "notary-confirmation",
    ],
  },
  {
    id: "sentinel",
    number: 6,
    templates: [
      "sentinel-configuration",
      "escalation-path",
    ],
  },
  {
    id: "activation",
    number: 7,
    templates: [
      "activation-communication",
    ],
  },
  {
    id: "completion",
    number: 8,
    templates: [
      "completion-checklist",
      "satisfaction-survey",
    ],
  },
  {
    id: "compliance",
    number: 9,
    templates: [
      "audit-trail-entry",
      "document-retention-policy",
    ],
  },
];

// ─── Actions ────────────────────────────────────────────────

type Action =
  | { type: "SET_LANGUAGE"; language: Language }
  | { type: "SET_PHASE"; phase: PhaseId }
  | { type: "SET_TEMPLATE"; template: TemplateId | null }
  | { type: "UPDATE_TEMPLATE_DATA"; template: TemplateId; data: Record<string, unknown> }
  | { type: "SET_TEMPLATE_STATUS"; template: TemplateId; status: TemplateStatus }
  | { type: "RESET_ALL" };

function reducer(state: GeneratorState, action: Action): GeneratorState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, language: action.language };

    case "SET_PHASE":
      return { ...state, currentPhase: action.phase, currentTemplate: null };

    case "SET_TEMPLATE":
      return { ...state, currentTemplate: action.template };

    case "UPDATE_TEMPLATE_DATA": {
      const existing = state.templates[action.template];
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.template]: {
            ...existing,
            status: existing.status === "not-started" ? "in-progress" : existing.status,
            data: { ...existing.data, ...action.data },
          },
        },
      };
    }

    case "SET_TEMPLATE_STATUS": {
      const existing = state.templates[action.template];
      return {
        ...state,
        templates: {
          ...state.templates,
          [action.template]: {
            ...existing,
            status: action.status,
            completedAt: action.status === "completed" ? new Date().toISOString() : existing.completedAt,
          },
        },
      };
    }

    case "RESET_ALL":
      return createInitialState();

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────

interface TemplateContextType {
  state: GeneratorState;
  dispatch: React.Dispatch<Action>;
  getPhaseProgress: (phaseId: PhaseId) => { completed: number; total: number; percent: number };
  getTotalProgress: () => { completed: number; total: number; percent: number };
}

const TemplateContext = createContext<TemplateContextType | null>(null);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return loadState() || createInitialState();
  });

  // Persist state on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const getPhaseProgress = (phaseId: PhaseId) => {
    const phase = PHASE_DEFINITIONS.find((p) => p.id === phaseId);
    if (!phase) return { completed: 0, total: 0, percent: 0 };
    const completed = phase.templates.filter(
      (tid) => state.templates[tid]?.status === "completed"
    ).length;
    const total = phase.templates.length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getTotalProgress = () => {
    const allTemplates = PHASE_DEFINITIONS.flatMap((p) => p.templates);
    const completed = allTemplates.filter(
      (tid) => state.templates[tid]?.status === "completed"
    ).length;
    const total = allTemplates.length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <TemplateContext.Provider value={{ state, dispatch, getPhaseProgress, getTotalProgress }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider");
  return ctx;
}
