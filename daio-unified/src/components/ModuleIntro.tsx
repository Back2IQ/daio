import { useState, useEffect } from "react";
import { X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleIntroProps {
  moduleId: string;
  title: { en: string; de: string };
  description: { en: string; de: string };
  bullets?: { en: string[]; de: string[] };
}

const DISMISSED_KEY = "daio-intro-dismissed";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setDismissed(id: string) {
  const list = getDismissed();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
  }
}

export function ModuleIntro({ moduleId, title, description, bullets }: ModuleIntroProps) {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState<"en" | "de">("en");
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (!getDismissed().includes(moduleId)) {
      setVisible(true);
    }
  }, [moduleId]);

  function dismiss() {
    if (dontShow) setDismissed(moduleId);
    setVisible(false);
  }

  if (!visible) return null;

  const t = lang;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-[#1e2638] overflow-hidden shadow-2xl bg-[#141a2a]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-lg font-bold text-[#c9a54e]">{title[t]}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(t === "en" ? "de" : "en")}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#9ca3af] hover:text-[#e5e7eb] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {t === "en" ? "DE" : "EN"}
            </button>
            <button type="button" onClick={dismiss} className="text-[#6b7280] hover:text-[#e5e7eb] transition-colors" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-2">
          <p className="text-sm text-[#e5e7eb] leading-relaxed">{description[t]}</p>

          {bullets && bullets[t].length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {bullets[t].map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                  <span className="text-[#c9a54e] mt-0.5">&#8226;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="rounded border-[#1e2638] accent-[#c9a54e]"
            />
            <span className="text-xs text-[#9ca3af]">
              {t === "en" ? "Don\u2019t show this again" : "Nicht mehr anzeigen"}
            </span>
          </label>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={dismiss}
              className="bg-[#c9a54e] text-[#0a0f1a] hover:bg-[#d4af5a] font-semibold text-sm px-5"
            >
              {t === "en" ? "Got it" : "Verstanden"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Module intro content ─────────────────────────────────────────

export const MODULE_INTROS: Record<string, Omit<ModuleIntroProps, "moduleId">> = {
  calculator: {
    title: {
      en: "Value Explorer",
      de: "Wert-Explorer",
    },
    description: {
      en: "Estimate what your clients stand to lose if digital assets are not covered by succession planning.",
      de: "Schätzen Sie, was Ihre Mandanten verlieren, wenn digitale Assets nicht in der Nachfolgeplanung berücksichtigt werden.",
    },
    bullets: {
      en: [
        "Model portfolios across crypto, gaming, social media, and more",
        "See risk exposure by asset category",
        "Generate a loss scenario for client conversations",
      ],
      de: [
        "Portfolios modellieren: Krypto, Gaming, Social Media und mehr",
        "Risikoexposition nach Asset-Kategorie sehen",
        "Verlustszenario für Mandantengespräche generieren",
      ],
    },
  },
  "strategic-platform": {
    title: {
      en: "Strategic Platform",
      de: "Strategische Plattform",
    },
    description: {
      en: "10 instruments that demonstrate why digital asset succession planning is not optional — and how governance mechanisms work.",
      de: "10 Instrumente, die zeigen, warum digitale Vermögensnachfolge keine Option ist — und wie Governance-Mechanismen funktionieren.",
    },
    bullets: {
      en: [
        "Part 1: Identify the need — loss simulators, key-person risk, stress tests",
        "Part 2: Understand mechanisms — governance flows, no-custody architecture, continuity index",
      ],
      de: [
        "Teil 1: Bedarf identifizieren — Verlustsimulationen, Schlüsselperson-Risiko, Stresstests",
        "Teil 2: Mechanismen verstehen — Governance-Flows, No-Custody-Architektur, Kontinuitätsindex",
      ],
    },
  },
  "template-generator": {
    title: {
      en: "Template Generator",
      de: "Vorlagen-Generator",
    },
    description: {
      en: "Generate governance documents for digital asset succession — from onboarding to audit trail.",
      de: "Erstellen Sie Governance-Dokumente für die digitale Vermögensnachfolge — von Onboarding bis Audit-Trail.",
    },
    bullets: {
      en: [
        "9 phases covering the full succession lifecycle",
        "Pre-filled templates based on your inputs",
        "Export-ready for client use",
      ],
      de: [
        "9 Phasen des gesamten Nachfolge-Lebenszyklus",
        "Vorausgefüllte Vorlagen basierend auf Ihren Eingaben",
        "Exportbereit für den Mandanteneinsatz",
      ],
    },
  },
  "portfolio-dashboard": {
    title: {
      en: "Continuity Dashboard",
      de: "Kontinuitäts-Dashboard",
    },
    description: {
      en: "A live dashboard demonstrating how governance works in practice — from portfolio overview to incident simulation.",
      de: "Ein Live-Dashboard, das zeigt, wie Governance in der Praxis funktioniert — von der Portfolio-Übersicht bis zur Vorfallsimulation.",
    },
    bullets: {
      en: [
        "Portfolio continuity overview with risk scoring",
        "Governance map builder for asset relationships",
        "Incident simulator for succession event testing",
        "Legacy proof lab and compliance navigator",
      ],
      de: [
        "Portfolio-Kontinuitätsübersicht mit Risikobewertung",
        "Governance-Map-Builder für Asset-Beziehungen",
        "Vorfallsimulator für Nachfolge-Events",
        "Legacy-Proof-Lab und Compliance-Navigator",
      ],
    },
  },
  "vault-protocol": {
    title: {
      en: "Vault Protocol",
      de: "Vault-Protokoll",
    },
    description: {
      en: "Shamir's Secret Sharing, Inheritance Container, and beneficiary management — the cryptographic backbone of DAIO governance.",
      de: "Shamir's Secret Sharing, Inheritance Container und Begünstigtenverwaltung — das kryptografische Rückgrat der DAIO-Governance.",
    },
    bullets: {
      en: [
        "Create encrypted vaults, verify shards, reconstruct secrets",
        "3-level Inheritance Container with AI-assisted documentation",
        "Beneficiary management: heirs, guardians, notaries",
        "Shamir key fragment generation and distribution",
        "Honeypot detection for unauthorized access attempts",
      ],
      de: [
        "Verschlüsselte Vaults erstellen, Shards verifizieren, Geheimnisse rekonstruieren",
        "3-stufiger Inheritance Container mit KI-gestützter Dokumentation",
        "Begünstigtenverwaltung: Erben, Vormunde, Notare",
        "Shamir-Schlüsselfragment-Generierung und -Verteilung",
        "Honeypot-Erkennung für unautorisierte Zugriffsversuche",
      ],
    },
  },
  "digital-estate": {
    title: {
      en: "Digital Estate",
      de: "Digitaler Nachlass",
    },
    description: {
      en: "Inventory your digital assets across 12 categories and assess your succession risk with a weighted scoring system.",
      de: "Inventarisieren Sie Ihre digitalen Assets in 12 Kategorien und bewerten Sie Ihr Nachfolgerisiko mit einem gewichteten Scoring-System.",
    },
    bullets: {
      en: [
        "Inventory: crypto, NFTs, gaming, social media, domains, and 7 more categories",
        "Risk Assessment: 37 questions, heatmap, score per category",
        "Data persists locally — your assets stay on your device",
      ],
      de: [
        "Inventar: Krypto, NFTs, Gaming, Social Media, Domains und 7 weitere Kategorien",
        "Risikobewertung: 37 Fragen, Heatmap, Score pro Kategorie",
        "Daten bleiben lokal — Ihre Assets verlassen Ihr Gerät nicht",
      ],
    },
  },
  "document-rewriter": {
    title: {
      en: "Document Rewriter",
      de: "Dokument-Umschreiber",
    },
    description: {
      en: "Harmonize existing documents to meet digital asset governance standards — terminology, compliance rules, and institutional tone.",
      de: "Harmonisieren Sie bestehende Dokumente nach Standards für digitale Asset-Governance — Terminologie, Compliance-Regeln und institutioneller Ton.",
    },
    bullets: {
      en: [
        "Upload documents and run through compliance pipeline",
        "Terminology harmonization and rule checks",
        "Side-by-side diff view of changes",
      ],
      de: [
        "Dokumente hochladen und durch Compliance-Pipeline führen",
        "Terminologie-Harmonisierung und Regelprüfung",
        "Nebeneinander-Vergleichsansicht der Änderungen",
      ],
    },
  },
  "succession-sentinel": {
    title: {
      en: "Succession Sentinel",
      de: "Nachfolge-Wächter",
    },
    description: {
      en: "The Dead Man's Switch for digital assets — automated check-ins, 4-stage escalation, emergency protocol, and your DAIO Governance Score.",
      de: "Der Dead Man's Switch für digitale Assets — automatische Check-ins, 4-stufige Eskalation, Notfallprotokoll und Ihr DAIO Governance Score.",
    },
    bullets: {
      en: [
        "Proof of Life check-ins with configurable intervals",
        "4-stage escalation: warning → escalation → critical → triggered",
        "Emergency protocol with key fragment regeneration",
        "DAIO Governance Score across 6 categories (max 100)",
      ],
      de: [
        "Proof-of-Life Check-ins mit konfigurierbaren Intervallen",
        "4-stufige Eskalation: Warnung → Eskalation → Kritisch → Ausgelöst",
        "Notfallprotokoll mit Key-Fragment-Regenerierung",
        "DAIO Governance Score über 6 Kategorien (max 100)",
      ],
    },
  },
  "inheritance-vault": {
    title: {
      en: "Inheritance Vault",
      de: "Erbschafts-Tresor",
    },
    description: {
      en: "Document your digital estate, designate beneficiaries, and generate Shamir key fragments for secure succession.",
      de: "Dokumentieren Sie Ihren digitalen Nachlass, benennen Sie Begünstigte und generieren Sie Shamir-Schlüsselfragmente für sichere Nachfolge.",
    },
    bullets: {
      en: [
        "3-level Inheritance Container: Foundation → Extended → Professional",
        "Beneficiary management: heirs, guardians, notaries",
        "Shamir key fragment generation with configurable threshold",
      ],
      de: [
        "3-stufiger Inheritance Container: Basis → Erweitert → Professionell",
        "Begünstigtenverwaltung: Erben, Vormunde, Notare",
        "Shamir-Schlüsselfragment-Generierung mit konfigurierbarem Schwellenwert",
      ],
    },
  },
};
