import { useState, useMemo } from "react";
import { TemplateProvider, useTemplates, PHASE_DEFINITIONS } from "./context/TemplateContext";
import { I18nContext, getTranslations } from "./i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, Search, Box, Shield, ArrowRightLeft,
  Eye, Bell, CheckCircle2, FileCheck,
  ChevronLeft, ChevronRight, Download, RotateCcw,
  FileText, Globe,
} from "lucide-react";
import { exportAllAsJson, exportTemplateAsJson, downloadJson, printTemplate } from "./utils/export";
import { clearState } from "./utils/storage";
import type { Language, PhaseId, TemplateId } from "./types";

// Template component imports
import { InitialConsultation } from "./templates/phase1/InitialConsultation";
import { OnboardingChecklist } from "./templates/phase1/OnboardingChecklist";
import { ExpectationManagement } from "./templates/phase1/ExpectationManagement";
import { DataProtectionConsent } from "./templates/phase1/DataProtectionConsent";
import { DigitalAssetInventory } from "./templates/phase2/DigitalAssetInventory";
import { WalletCategorization } from "./templates/phase2/WalletCategorization";
import { ExchangeAccountDoc } from "./templates/phase2/ExchangeAccountDoc";
import { ContainerStructure } from "./templates/phase3/ContainerStructure";
import { HeirProfile } from "./templates/phase3/HeirProfile";
import { DigitalWill } from "./templates/phase3/DigitalWill";
import { ProofCreationChecklist } from "./templates/phase4/ProofCreationChecklist";
import { ProofCertificate } from "./templates/phase4/ProofCertificate";
import { TransferGateMatrix } from "./templates/phase5/TransferGateMatrix";
import { NotaryConfirmation } from "./templates/phase5/NotaryConfirmation";
import { SentinelConfiguration } from "./templates/phase6/SentinelConfiguration";
import { EscalationPath } from "./templates/phase6/EscalationPath";
import { ActivationCommunication } from "./templates/phase7/ActivationCommunication";
import { CompletionChecklist } from "./templates/phase8/CompletionChecklist";
import { SatisfactionSurvey } from "./templates/phase8/SatisfactionSurvey";
import { AuditTrailEntry } from "./templates/phase9/AuditTrailEntry";
import { DocumentRetentionPolicy } from "./templates/phase9/DocumentRetentionPolicy";

const TEMPLATE_COMPONENTS: Record<TemplateId, React.FC> = {
  "initial-consultation": InitialConsultation,
  "onboarding-checklist": OnboardingChecklist,
  "expectation-management": ExpectationManagement,
  "data-protection-consent": DataProtectionConsent,
  "digital-asset-inventory": DigitalAssetInventory,
  "wallet-categorization": WalletCategorization,
  "exchange-account-doc": ExchangeAccountDoc,
  "container-structure": ContainerStructure,
  "heir-profile": HeirProfile,
  "digital-will": DigitalWill,
  "proof-creation-checklist": ProofCreationChecklist,
  "proof-certificate": ProofCertificate,
  "transfer-gate-matrix": TransferGateMatrix,
  "notary-confirmation": NotaryConfirmation,
  "sentinel-configuration": SentinelConfiguration,
  "escalation-path": EscalationPath,
  "activation-communication": ActivationCommunication,
  "completion-checklist": CompletionChecklist,
  "satisfaction-survey": SatisfactionSurvey,
  "audit-trail-entry": AuditTrailEntry,
  "document-retention-policy": DocumentRetentionPolicy,
};

const PHASE_ICONS: Record<PhaseId, React.ReactNode> = {
  "client-acquisition": <Users className="w-4 h-4" />,
  "asset-discovery": <Search className="w-4 h-4" />,
  "container-creation": <Box className="w-4 h-4" />,
  "legacy-proof": <Shield className="w-4 h-4" />,
  "transfer-gate": <ArrowRightLeft className="w-4 h-4" />,
  sentinel: <Eye className="w-4 h-4" />,
  activation: <Bell className="w-4 h-4" />,
  completion: <CheckCircle2 className="w-4 h-4" />,
  compliance: <FileCheck className="w-4 h-4" />,
};

function AppContent() {
  const { state, dispatch, getPhaseProgress, getTotalProgress } = useTemplates();
  const t = useMemo(() => getTranslations(state.language), [state.language]);
  const [language, setLanguage] = useState<Language>(state.language);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    dispatch({ type: "SET_LANGUAGE", language: lang });
  };

  const totalProgress = getTotalProgress();
  const currentPhase = PHASE_DEFINITIONS.find((p) => p.id === state.currentPhase)!;
  const ActiveTemplate = state.currentTemplate ? TEMPLATE_COMPONENTS[state.currentTemplate] : null;

  const handleExportAll = () => {
    const json = exportAllAsJson(state);
    downloadJson(json, `daio-templates-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportTemplate = () => {
    if (!state.currentTemplate) return;
    const json = exportTemplateAsJson(state, state.currentTemplate);
    downloadJson(json, `daio-${state.currentTemplate}-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleReset = () => {
    if (window.confirm("Reset all data? This cannot be undone.")) {
      clearState();
      dispatch({ type: "RESET_ALL" });
    }
  };

  const handleComplete = () => {
    if (!state.currentTemplate) return;
    dispatch({ type: "SET_TEMPLATE_STATUS", template: state.currentTemplate, status: "completed" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "not-started": return "bg-slate-300";
      default: return "bg-slate-200";
    }
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage: handleLanguageChange }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Back2IQ" className="h-9 w-auto" />
                <div>
                  <h1 className="font-semibold text-lg leading-tight">{t.app.title}</h1>
                  <p className="text-xs text-muted-foreground">Back2IQ — Ahead by Design</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t.app.progress}:</span>
                  <Progress value={totalProgress.percent} className="w-24 h-2" />
                  <span className="font-medium">{totalProgress.completed}/{totalProgress.total}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={handleExportAll}>
                  <Download className="w-4 h-4 mr-1" /> {t.app.exportAll}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto flex">
          {/* Phase Sidebar */}
          <aside className="w-72 border-r min-h-[calc(100vh-57px)] bg-card sticky top-[57px] self-start">
            <ScrollArea className="h-[calc(100vh-57px)]">
              <div className="p-3 space-y-1">
                {PHASE_DEFINITIONS.map((phase) => {
                  const progress = getPhaseProgress(phase.id);
                  const isActive = state.currentPhase === phase.id;
                  const phaseT = t.phases[phase.id];
                  return (
                    <div key={phase.id}>
                      <button
                        onClick={() => dispatch({ type: "SET_PHASE", phase: phase.id })}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {PHASE_ICONS[phase.id]}
                          </div>
                          <span className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                            {phase.number}. {phaseT.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-8 line-clamp-2">{phaseT.description}</p>
                        <div className="flex items-center gap-2 ml-8 mt-2">
                          <Progress value={progress.percent} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{progress.completed}/{progress.total}</span>
                        </div>
                      </button>

                      {/* Template list when phase is active */}
                      {isActive && (
                        <div className="ml-8 mt-1 space-y-0.5">
                          {phase.templates.map((templateId) => {
                            const templateT = t.templates[templateId];
                            const templateState = state.templates[templateId];
                            const isSelected = state.currentTemplate === templateId;
                            return (
                              <button
                                key={templateId}
                                onClick={() => dispatch({ type: "SET_TEMPLATE", template: templateId })}
                                className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center gap-2 ${
                                  isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(templateState?.status || "not-started")}`} />
                                <span className="line-clamp-1">{templateT.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-57px)]">
            {state.currentTemplate && ActiveTemplate ? (
              <div className="p-6">
                {/* Template Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      {PHASE_ICONS[state.currentPhase]}
                      <span>Phase {currentPhase.number}: {t.phases[state.currentPhase].title}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{t.templates[state.currentTemplate].title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.templates[state.currentTemplate].description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(state.templates[state.currentTemplate]?.status || "not-started")}>
                      {t.app.status[state.templates[state.currentTemplate]?.status === "not-started" ? "notStarted" :
                        state.templates[state.currentTemplate]?.status === "in-progress" ? "inProgress" :
                        state.templates[state.currentTemplate]?.status === "completed" ? "completed" : "locked"]}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                      <Download className="w-4 h-4 mr-1" /> JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={printTemplate}>
                      <FileText className="w-4 h-4 mr-1" /> Print
                    </Button>
                  </div>
                </div>

                {/* Template Form */}
                <ActiveTemplate />

                {/* Navigation Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const templates = currentPhase.templates;
                      const idx = templates.indexOf(state.currentTemplate!);
                      if (idx > 0) {
                        dispatch({ type: "SET_TEMPLATE", template: templates[idx - 1] });
                      } else {
                        const phaseIdx = PHASE_DEFINITIONS.indexOf(currentPhase);
                        if (phaseIdx > 0) {
                          const prevPhase = PHASE_DEFINITIONS[phaseIdx - 1];
                          dispatch({ type: "SET_PHASE", phase: prevPhase.id });
                          dispatch({ type: "SET_TEMPLATE", template: prevPhase.templates[prevPhase.templates.length - 1] });
                        }
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> {t.app.previous}
                  </Button>

                  <Button onClick={handleComplete} variant={state.templates[state.currentTemplate]?.status === "completed" ? "secondary" : "default"}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> {t.app.complete}
                  </Button>

                  <Button
                    onClick={() => {
                      const templates = currentPhase.templates;
                      const idx = templates.indexOf(state.currentTemplate!);
                      if (idx < templates.length - 1) {
                        dispatch({ type: "SET_TEMPLATE", template: templates[idx + 1] });
                      } else {
                        const phaseIdx = PHASE_DEFINITIONS.indexOf(currentPhase);
                        if (phaseIdx < PHASE_DEFINITIONS.length - 1) {
                          const nextPhase = PHASE_DEFINITIONS[phaseIdx + 1];
                          dispatch({ type: "SET_PHASE", phase: nextPhase.id });
                          dispatch({ type: "SET_TEMPLATE", template: nextPhase.templates[0] });
                        }
                      }
                    }}
                  >
                    {t.app.next} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Phase Overview (no template selected) */
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {PHASE_ICONS[state.currentPhase]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Phase {currentPhase.number}: {t.phases[state.currentPhase].title}</h2>
                    <p className="text-sm text-muted-foreground">{t.phases[state.currentPhase].description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {currentPhase.templates.map((templateId) => {
                    const templateT = t.templates[templateId];
                    const templateState = state.templates[templateId];
                    return (
                      <Card
                        key={templateId}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => dispatch({ type: "SET_TEMPLATE", template: templateId })}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{templateT.title}</CardTitle>
                            <Badge className={getStatusColor(templateState?.status || "not-started")}>
                              {t.app.status[templateState?.status === "completed" ? "completed" :
                                templateState?.status === "in-progress" ? "inProgress" : "notStarted"]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{templateT.description}</p>
                          {templateState?.completedAt && (
                            <p className="text-xs text-green-600 mt-2">
                              Completed: {new Date(templateState.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Phase Progress Summary */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Phase Progress</p>
                        <p className="text-2xl font-bold">{getPhaseProgress(state.currentPhase).percent}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Overall Progress</p>
                        <p className="text-2xl font-bold">{totalProgress.percent}%</p>
                      </div>
                    </div>
                    <Progress value={getPhaseProgress(state.currentPhase).percent} className="mt-3" />
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </I18nContext.Provider>
  );
}

export default function App() {
  return (
    <TemplateProvider>
      <AppContent />
    </TemplateProvider>
  );
}
