import type { GeneratorState, TemplateId, TemplateState } from "../types";
import { PHASE_DEFINITIONS } from "../context/TemplateContext";

const STORAGE_KEY = "daio-template-generator";

function createInitialTemplateState(id: TemplateId): TemplateState {
  return { id, status: "not-started", data: {} };
}

export function createInitialState(): GeneratorState {
  const templates = {} as Record<TemplateId, TemplateState>;
  for (const phase of PHASE_DEFINITIONS) {
    for (const templateId of phase.templates) {
      templates[templateId] = createInitialTemplateState(templateId);
    }
  }
  return {
    language: "en",
    currentPhase: "client-acquisition",
    currentTemplate: null,
    templates,
  };
}

export function loadState(): GeneratorState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GeneratorState;
  } catch {
    return null;
  }
}

export function saveState(state: GeneratorState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
