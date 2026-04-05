import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { DataProtectionConsentData } from "../../types";

const DEFAULTS: DataProtectionConsentData = {
  companyName: "", companyContact: "", dataProtectionOfficer: "",
  firstName: "", lastName: "", dateOfBirth: "", address: "",
  consentGiven: false,
  processingScopes: { personalData: true, maritalData: true, assetData: true, accessCredentials: true, communicationData: true, billingData: true },
  purposes: { containerCreation: true, legacyProof: true, sentinelConfig: true, communication: true, documentation: true },
  retentionPeriodYears: 10,
  signatureDate: "",
};

export function DataProtectionConsent() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["data-protection-consent"].data as Partial<DataProtectionConsentData>) };

  const update = (partial: Partial<DataProtectionConsentData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "data-protection-consent", data: partial });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800 dark:text-blue-300">GDPR Art. 13 — Data Protection Consent</p>
        <p className="text-blue-700 dark:text-blue-400 mt-1">This form documents formal consent for processing personal and asset-related data according to GDPR requirements.</p>
      </div>

      <FormSection title="Responsible Party">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.companyName} value={data.companyName} onChange={(v) => update({ companyName: v })} required />
          <FormField type="text" label="Company Contact" value={data.companyContact} onChange={(v) => update({ companyContact: v })} />
          <FormField type="text" label="Data Protection Officer" value={data.dataProtectionOfficer} onChange={(v) => update({ dataProtectionOfficer: v })} />
        </div>
      </FormSection>

      <FormSection title="Data Subject">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.firstName} value={data.firstName} onChange={(v) => update({ firstName: v })} required />
          <FormField type="text" label={t.fields.lastName} value={data.lastName} onChange={(v) => update({ lastName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.dateOfBirth} onChange={(v) => update({ dateOfBirth: v })} required />
          <FormField type="text" label={t.fields.address} value={data.address} onChange={(v) => update({ address: v })} required />
        </div>
      </FormSection>

      <FormSection title={t.sections.scopeOfProcessing}>
        <p className="text-sm text-muted-foreground mb-3">Data categories to be processed:</p>
        <div className="grid md:grid-cols-2 gap-2">
          <FormField type="checkbox" label="Personal Master Data (Name, DOB, Address, Contact)" checked={data.processingScopes.personalData} onChange={(c) => update({ processingScopes: { ...data.processingScopes, personalData: c } })} />
          <FormField type="checkbox" label="Marital Status and Family Relationships" checked={data.processingScopes.maritalData} onChange={(c) => update({ processingScopes: { ...data.processingScopes, maritalData: c } })} />
          <FormField type="checkbox" label="Asset-Related Data (Type, Scope, Custody)" checked={data.processingScopes.assetData} onChange={(c) => update({ processingScopes: { ...data.processingScopes, assetData: c } })} />
          <FormField type="checkbox" label="Access Credentials and Technical Info (Encrypted)" checked={data.processingScopes.accessCredentials} onChange={(c) => update({ processingScopes: { ...data.processingScopes, accessCredentials: c } })} />
          <FormField type="checkbox" label="Communication and Correspondence Data" checked={data.processingScopes.communicationData} onChange={(c) => update({ processingScopes: { ...data.processingScopes, communicationData: c } })} />
          <FormField type="checkbox" label="Billing and Payment Data" checked={data.processingScopes.billingData} onChange={(c) => update({ processingScopes: { ...data.processingScopes, billingData: c } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.purposeOfProcessing}>
        <div className="grid md:grid-cols-2 gap-2">
          <FormField type="checkbox" label="Inheritance Container Creation and Management" checked={data.purposes.containerCreation} onChange={(c) => update({ purposes: { ...data.purposes, containerCreation: c } })} />
          <FormField type="checkbox" label="Legacy Proof Protocol Execution" checked={data.purposes.legacyProof} onChange={(c) => update({ purposes: { ...data.purposes, legacyProof: c } })} />
          <FormField type="checkbox" label="Succession Sentinel Configuration" checked={data.purposes.sentinelConfig} onChange={(c) => update({ purposes: { ...data.purposes, sentinelConfig: c } })} />
          <FormField type="checkbox" label="Communication Within Consulting Scope" checked={data.purposes.communication} onChange={(c) => update({ purposes: { ...data.purposes, communication: c } })} />
          <FormField type="checkbox" label="Documentation per Regulatory Requirements" checked={data.purposes.documentation} onChange={(c) => update({ purposes: { ...data.purposes, documentation: c } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.retentionDeletion}>
        <FormField type="number" label={t.fields.retentionPeriodYears} value={data.retentionPeriodYears} onChange={(v) => update({ retentionPeriodYears: Number(v) })} />
        <p className="text-xs text-muted-foreground">Storage until end of consulting relationship plus legally required retention periods (typically 10 years post-relationship termination).</p>
      </FormSection>

      <FormSection title="Consent and Signature">
        <FormField type="checkbox" label="I hereby consent to the processing of my data as described above" checked={data.consentGiven} onChange={(c) => update({ consentGiven: c })} />
        <FormField type="date" label={t.fields.signatureDate} value={data.signatureDate} onChange={(v) => update({ signatureDate: v })} />
        <p className="text-xs text-muted-foreground mt-2">This consent can be revoked at any time with future effect. Revocation does not affect the lawfulness of past processing.</p>
      </FormSection>
    </div>
  );
}
