import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { OnboardingChecklistData } from "../../types";

const DEFAULTS: OnboardingChecklistData = {
  clientName: "", clientId: "", contactPerson: "", startDate: "", expectedEndDate: "",
  phase1: { consultingAgreement: false, dataProtectionConsent: false, powersOfAttorney: false, goalAgreement: false },
  phase2: { questionnaireComplete: false, inventoryCreated: false, walletCategorization: false, exchangeDocumentation: false, onChainAnalysis: false },
  phase3: { containerStructure: false, heirProfiles: false, successionConditions: false, digitalWill: false, keyManagement: false },
  phase4: { legacyProof: false, validationDoc: false, qualityCheck: false, clientApproval: false, sentinelConfig: false },
  completion: { documentationStored: false, followUpScheduled: false, clientFileClosed: false },
  completionDate: "", totalDurationDays: 0, processingTimeHours: 0, specialNotes: "",
};

export function OnboardingChecklist() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["onboarding-checklist"].data as Partial<OnboardingChecklistData>) };

  const update = (partial: Partial<OnboardingChecklistData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "onboarding-checklist", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="text" label={t.fields.clientId} value={data.clientId} onChange={(v) => update({ clientId: v })} required />
          <FormField type="text" label={t.fields.contactPerson} value={data.contactPerson} onChange={(v) => update({ contactPerson: v })} />
          <FormField type="date" label={t.fields.startDate} value={data.startDate} onChange={(v) => update({ startDate: v })} required />
          <FormField type="date" label={t.fields.expectedEndDate} value={data.expectedEndDate} onChange={(v) => update({ expectedEndDate: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.contractualBasis}>
        <FormField type="checkbox" label="Consulting Agreement Signed" checked={data.phase1.consultingAgreement} onChange={(c) => update({ phase1: { ...data.phase1, consultingAgreement: c } })} />
        <FormField type="checkbox" label="Data Protection Consent Obtained" checked={data.phase1.dataProtectionConsent} onChange={(c) => update({ phase1: { ...data.phase1, dataProtectionConsent: c } })} />
        <FormField type="checkbox" label="Powers of Attorney for Succession Matters" checked={data.phase1.powersOfAttorney} onChange={(c) => update({ phase1: { ...data.phase1, powersOfAttorney: c } })} />
        <FormField type="checkbox" label="Goal Agreement / Kick-off Completed" checked={data.phase1.goalAgreement} onChange={(c) => update({ phase1: { ...data.phase1, goalAgreement: c } })} />
      </FormSection>

      <FormSection title={t.sections.assetDiscoveryPhase}>
        <FormField type="checkbox" label="Initial Consultation Questionnaire Completed" checked={data.phase2.questionnaireComplete} onChange={(c) => update({ phase2: { ...data.phase2, questionnaireComplete: c } })} />
        <FormField type="checkbox" label="Digital Asset Inventory Created" checked={data.phase2.inventoryCreated} onChange={(c) => update({ phase2: { ...data.phase2, inventoryCreated: c } })} />
        <FormField type="checkbox" label="Wallet Categorization Done" checked={data.phase2.walletCategorization} onChange={(c) => update({ phase2: { ...data.phase2, walletCategorization: c } })} />
        <FormField type="checkbox" label="Exchange Accounts Documented" checked={data.phase2.exchangeDocumentation} onChange={(c) => update({ phase2: { ...data.phase2, exchangeDocumentation: c } })} />
        <FormField type="checkbox" label="On-Chain Analysis Performed" checked={data.phase2.onChainAnalysis} onChange={(c) => update({ phase2: { ...data.phase2, onChainAnalysis: c } })} />
      </FormSection>

      <FormSection title={t.sections.containerCreationPhase}>
        <FormField type="checkbox" label="Inheritance Container Structure Defined" checked={data.phase3.containerStructure} onChange={(c) => update({ phase3: { ...data.phase3, containerStructure: c } })} />
        <FormField type="checkbox" label="Heir Profiles Created" checked={data.phase3.heirProfiles} onChange={(c) => update({ phase3: { ...data.phase3, heirProfiles: c } })} />
        <FormField type="checkbox" label="Succession Conditions Documented" checked={data.phase3.successionConditions} onChange={(c) => update({ phase3: { ...data.phase3, successionConditions: c } })} />
        <FormField type="checkbox" label="Digital Will Created" checked={data.phase3.digitalWill} onChange={(c) => update({ phase3: { ...data.phase3, digitalWill: c } })} />
        <FormField type="checkbox" label="Encryption and Key Management Setup" checked={data.phase3.keyManagement} onChange={(c) => update({ phase3: { ...data.phase3, keyManagement: c } })} />
      </FormSection>

      <FormSection title={t.sections.validationRelease}>
        <FormField type="checkbox" label="Legacy Proof Protocol Performed" checked={data.phase4.legacyProof} onChange={(c) => update({ phase4: { ...data.phase4, legacyProof: c } })} />
        <FormField type="checkbox" label="Validation Documentation Complete" checked={data.phase4.validationDoc} onChange={(c) => update({ phase4: { ...data.phase4, validationDoc: c } })} />
        <FormField type="checkbox" label="Internal Quality Check Passed" checked={data.phase4.qualityCheck} onChange={(c) => update({ phase4: { ...data.phase4, qualityCheck: c } })} />
        <FormField type="checkbox" label="Client Approval Received" checked={data.phase4.clientApproval} onChange={(c) => update({ phase4: { ...data.phase4, clientApproval: c } })} />
        <FormField type="checkbox" label="Succession Sentinel Configured" checked={data.phase4.sentinelConfig} onChange={(c) => update({ phase4: { ...data.phase4, sentinelConfig: c } })} />
      </FormSection>

      <FormSection title={t.sections.onboardingCompletion}>
        <FormField type="checkbox" label="Documentation Stored" checked={data.completion.documentationStored} onChange={(c) => update({ completion: { ...data.completion, documentationStored: c } })} />
        <FormField type="checkbox" label="Follow-up Scheduled" checked={data.completion.followUpScheduled} onChange={(c) => update({ completion: { ...data.completion, followUpScheduled: c } })} />
        <FormField type="checkbox" label="Client File Closed" checked={data.completion.clientFileClosed} onChange={(c) => update({ completion: { ...data.completion, clientFileClosed: c } })} />
      </FormSection>

      <FormSection title={t.sections.overallAssessment}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="date" label="Completion Date" value={data.completionDate} onChange={(v) => update({ completionDate: v })} />
          <FormField type="number" label="Total Duration (Days)" value={data.totalDurationDays} onChange={(v) => update({ totalDurationDays: Number(v) })} />
          <FormField type="number" label="Processing Time (Hours)" value={data.processingTimeHours} onChange={(v) => update({ processingTimeHours: Number(v) })} />
        </div>
        <FormField type="textarea" label="Special Notes" value={data.specialNotes} onChange={(v) => update({ specialNotes: v })} />
      </FormSection>
    </div>
  );
}
