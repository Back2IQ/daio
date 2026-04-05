import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { ExpectationManagementData } from "../../types";

const DEFAULTS: ExpectationManagementData = {
  clientName: "", consultantName: "", date: new Date().toISOString().slice(0, 10),
  servicePackage: "PROFESSIONAL", containersToCreate: 1, walletsToDocument: 0,
  legacyProofValidation: true, sentinelSetupDuration: "", consultationHours: 0,
  excludedServices: { legalAdvice: true, taxAdvice: true, smartContractImpl: true, forensicAnalysis: true, authorityCommunication: true },
  processingTimeMaxDays: 2, availabilityHours: "", escalationPath: "",
};

export function ExpectationManagement() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["expectation-management"].data as Partial<ExpectationManagementData>) };

  const update = (partial: Partial<ExpectationManagementData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "expectation-management", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="text" label={t.fields.consultant} value={data.consultantName} onChange={(v) => update({ consultantName: v })} required />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
          <FormField type="select" label={t.fields.servicePackage} value={data.servicePackage} onChange={(v) => update({ servicePackage: v as ExpectationManagementData["servicePackage"] })} options={[
            { value: "BASIC", label: "BASIC" },
            { value: "PROFESSIONAL", label: "PROFESSIONAL" },
            { value: "PREMIUM", label: "PREMIUM" },
            { value: "INDIVIDUAL", label: "INDIVIDUAL" },
          ]} />
        </div>
      </FormSection>

      <FormSection title={t.sections.servicesIncluded}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="number" label={t.fields.containersToCreate} value={data.containersToCreate} onChange={(v) => update({ containersToCreate: Number(v) })} />
          <FormField type="number" label={t.fields.walletsToDocument} value={data.walletsToDocument} onChange={(v) => update({ walletsToDocument: Number(v) })} />
          <FormField type="checkbox" label="Legacy Proof Validation" checked={data.legacyProofValidation} onChange={(c) => update({ legacyProofValidation: c })} />
          <FormField type="text" label="Sentinel Setup Duration" value={data.sentinelSetupDuration} onChange={(v) => update({ sentinelSetupDuration: v })} />
          <FormField type="number" label={t.fields.consultationHours} value={data.consultationHours} onChange={(v) => update({ consultationHours: Number(v) })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.servicesExcluded}>
        <p className="text-sm text-muted-foreground mb-3">Services explicitly excluded from scope:</p>
        <FormField type="checkbox" label="Legal Advice" checked={data.excludedServices.legalAdvice} onChange={(c) => update({ excludedServices: { ...data.excludedServices, legalAdvice: c } })} />
        <FormField type="checkbox" label="Tax Advice" checked={data.excludedServices.taxAdvice} onChange={(c) => update({ excludedServices: { ...data.excludedServices, taxAdvice: c } })} />
        <FormField type="checkbox" label="Smart Contract Implementation" checked={data.excludedServices.smartContractImpl} onChange={(c) => update({ excludedServices: { ...data.excludedServices, smartContractImpl: c } })} />
        <FormField type="checkbox" label="Forensic Analysis" checked={data.excludedServices.forensicAnalysis} onChange={(c) => update({ excludedServices: { ...data.excludedServices, forensicAnalysis: c } })} />
        <FormField type="checkbox" label="Authority Communication" checked={data.excludedServices.authorityCommunication} onChange={(c) => update({ excludedServices: { ...data.excludedServices, authorityCommunication: c } })} />
      </FormSection>

      <FormSection title={t.sections.qualityCommitment}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="number" label={t.fields.processingTimeMaxDays} value={data.processingTimeMaxDays} onChange={(v) => update({ processingTimeMaxDays: Number(v) })} />
          <FormField type="text" label={t.fields.availabilityHours} value={data.availabilityHours} onChange={(v) => update({ availabilityHours: v })} placeholder="e.g. Mon-Fri 9:00-17:00" />
        </div>
        <FormField type="textarea" label="Escalation Path" value={data.escalationPath} onChange={(v) => update({ escalationPath: v })} />
      </FormSection>
    </div>
  );
}
