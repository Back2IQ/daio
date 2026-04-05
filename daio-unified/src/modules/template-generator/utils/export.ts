import type { GeneratorState, TemplateId } from "../types";
import { getTranslations } from "../i18n";

export function exportTemplateAsJson(state: GeneratorState, templateId: TemplateId): string {
  const t = getTranslations(state.language);
  const templateState = state.templates[templateId];
  const meta = t.templates[templateId];

  return JSON.stringify(
    {
      template: meta.title,
      description: meta.description,
      exportedAt: new Date().toISOString(),
      language: state.language,
      status: templateState.status,
      completedAt: templateState.completedAt,
      data: templateState.data,
    },
    null,
    2
  );
}

export function exportAllAsJson(state: GeneratorState): string {
  const t = getTranslations(state.language);
  const templates: Record<string, unknown> = {};

  for (const [id, ts] of Object.entries(state.templates)) {
    const meta = t.templates[id as TemplateId];
    templates[id] = {
      template: meta.title,
      status: ts.status,
      completedAt: ts.completedAt,
      data: ts.data,
    };
  }

  return JSON.stringify(
    {
      generator: "DAIO Template Generator",
      exportedAt: new Date().toISOString(),
      language: state.language,
      templates,
    },
    null,
    2
  );
}

export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printTemplate(): void {
  window.print();
}
