import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { ProofCreationChecklistData } from "../../types";

const DEFAULTS: ProofCreationChecklistData = {
  containerId: "", clientName: "", consultantName: "", date: new Date().toISOString().slice(0, 10),
  identityValidation: { identityProofVerified: false, proofType: "", proofNumber: "", issueDate: "", validityDate: "", photoVerified: false, addressVerified: false, signatureDocumented: false },
  heirValidation: { allHeirsIdentified: false, relationshipProofs: false, birthCertificates: false, marriageCertificates: false, deathCertificates: false, identityProofsCollected: false, entitlementDocumented: false },
  assetValidation: { allAssetsVerified: false, walletAddressesConfirmed: false, balancesDocumented: false, balanceDate: "", ownershipProofs: false, exchangeStatementsConfirmed: false },
  legalBasis: { willReferenced: false, powersDocumented: false, restrictionsIdentified: false, internationalChecked: false },
  technicalValidation: { encryptionActivated: false, keyManagementDocumented: false, accessRightsConfigured: false, integrityHashCreated: false },
  documentation: { proofCertificateCreated: false, validationReportGenerated: false, containerUpdated: false, metadataArchived: false },
  overallAssessment: "NOT_VALIDATED", assessmentReason: "", createdBy: "", checkedBy: "",
};

export function ProofCreationChecklist() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["proof-creation-checklist"].data as Partial<ProofCreationChecklistData>) };

  const update = (partial: Partial<ProofCreationChecklistData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "proof-creation-checklist", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} required />
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="text" label={t.fields.consultant} value={data.consultantName} onChange={(v) => update({ consultantName: v })} />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.identityValidation}>
        <FormField type="checkbox" label="Identity proof of asset owner verified" checked={data.identityValidation.identityProofVerified} onChange={(c) => update({ identityValidation: { ...data.identityValidation, identityProofVerified: c } })} />
        <div className="grid md:grid-cols-2 gap-4 ml-6">
          <FormField type="text" label="Proof Type (Passport/ID)" value={data.identityValidation.proofType} onChange={(v) => update({ identityValidation: { ...data.identityValidation, proofType: v } })} />
          <FormField type="text" label="Proof Number" value={data.identityValidation.proofNumber} onChange={(v) => update({ identityValidation: { ...data.identityValidation, proofNumber: v } })} />
          <FormField type="date" label="Issue Date" value={data.identityValidation.issueDate} onChange={(v) => update({ identityValidation: { ...data.identityValidation, issueDate: v } })} />
          <FormField type="date" label="Validity Date" value={data.identityValidation.validityDate} onChange={(v) => update({ identityValidation: { ...data.identityValidation, validityDate: v } })} />
        </div>
        <FormField type="checkbox" label="Photo verified with person" checked={data.identityValidation.photoVerified} onChange={(c) => update({ identityValidation: { ...data.identityValidation, photoVerified: c } })} />
        <FormField type="checkbox" label="Address verified" checked={data.identityValidation.addressVerified} onChange={(c) => update({ identityValidation: { ...data.identityValidation, addressVerified: c } })} />
        <FormField type="checkbox" label="Signature documented" checked={data.identityValidation.signatureDocumented} onChange={(c) => update({ identityValidation: { ...data.identityValidation, signatureDocumented: c } })} />
      </FormSection>

      <FormSection title={t.sections.heirValidation}>
        <FormField type="checkbox" label="All heirs identified and verified" checked={data.heirValidation.allHeirsIdentified} onChange={(c) => update({ heirValidation: { ...data.heirValidation, allHeirsIdentified: c } })} />
        <FormField type="checkbox" label="Relationship proofs documented" checked={data.heirValidation.relationshipProofs} onChange={(c) => update({ heirValidation: { ...data.heirValidation, relationshipProofs: c } })} />
        <FormField type="checkbox" label="Birth certificates collected" checked={data.heirValidation.birthCertificates} onChange={(c) => update({ heirValidation: { ...data.heirValidation, birthCertificates: c } })} />
        <FormField type="checkbox" label="Marriage certificates collected" checked={data.heirValidation.marriageCertificates} onChange={(c) => update({ heirValidation: { ...data.heirValidation, marriageCertificates: c } })} />
        <FormField type="checkbox" label="Identity proofs of heirs collected" checked={data.heirValidation.identityProofsCollected} onChange={(c) => update({ heirValidation: { ...data.heirValidation, identityProofsCollected: c } })} />
        <FormField type="checkbox" label="Entitlement status documented" checked={data.heirValidation.entitlementDocumented} onChange={(c) => update({ heirValidation: { ...data.heirValidation, entitlementDocumented: c } })} />
      </FormSection>

      <FormSection title={t.sections.assetValidation}>
        <FormField type="checkbox" label="All assets in container verified" checked={data.assetValidation.allAssetsVerified} onChange={(c) => update({ assetValidation: { ...data.assetValidation, allAssetsVerified: c } })} />
        <FormField type="checkbox" label="Wallet addresses confirmed on blockchain" checked={data.assetValidation.walletAddressesConfirmed} onChange={(c) => update({ assetValidation: { ...data.assetValidation, walletAddressesConfirmed: c } })} />
        <FormField type="checkbox" label="Balances documented" checked={data.assetValidation.balancesDocumented} onChange={(c) => update({ assetValidation: { ...data.assetValidation, balancesDocumented: c } })} />
        <FormField type="date" label="Balance Date" value={data.assetValidation.balanceDate} onChange={(v) => update({ assetValidation: { ...data.assetValidation, balanceDate: v } })} />
        <FormField type="checkbox" label="Proofs of ownership collected" checked={data.assetValidation.ownershipProofs} onChange={(c) => update({ assetValidation: { ...data.assetValidation, ownershipProofs: c } })} />
        <FormField type="checkbox" label="Exchange statements confirmed" checked={data.assetValidation.exchangeStatementsConfirmed} onChange={(c) => update({ assetValidation: { ...data.assetValidation, exchangeStatementsConfirmed: c } })} />
      </FormSection>

      <FormSection title={t.sections.legalBasis}>
        <FormField type="checkbox" label="Will / inheritance contract referenced" checked={data.legalBasis.willReferenced} onChange={(c) => update({ legalBasis: { ...data.legalBasis, willReferenced: c } })} />
        <FormField type="checkbox" label="Existing powers of attorney documented" checked={data.legalBasis.powersDocumented} onChange={(c) => update({ legalBasis: { ...data.legalBasis, powersDocumented: c } })} />
        <FormField type="checkbox" label="Legal restrictions identified" checked={data.legalBasis.restrictionsIdentified} onChange={(c) => update({ legalBasis: { ...data.legalBasis, restrictionsIdentified: c } })} />
        <FormField type="checkbox" label="International aspects checked" checked={data.legalBasis.internationalChecked} onChange={(c) => update({ legalBasis: { ...data.legalBasis, internationalChecked: c } })} />
      </FormSection>

      <FormSection title={t.sections.technicalValidation}>
        <FormField type="checkbox" label="Encryption activated" checked={data.technicalValidation.encryptionActivated} onChange={(c) => update({ technicalValidation: { ...data.technicalValidation, encryptionActivated: c } })} />
        <FormField type="checkbox" label="Key management documented" checked={data.technicalValidation.keyManagementDocumented} onChange={(c) => update({ technicalValidation: { ...data.technicalValidation, keyManagementDocumented: c } })} />
        <FormField type="checkbox" label="Access rights configured" checked={data.technicalValidation.accessRightsConfigured} onChange={(c) => update({ technicalValidation: { ...data.technicalValidation, accessRightsConfigured: c } })} />
        <FormField type="checkbox" label="Integrity hash created" checked={data.technicalValidation.integrityHashCreated} onChange={(c) => update({ technicalValidation: { ...data.technicalValidation, integrityHashCreated: c } })} />
      </FormSection>

      <FormSection title={t.sections.validationSummary}>
        <FormField type="select" label="Overall Assessment" value={data.overallAssessment} onChange={(v) => update({ overallAssessment: v as ProofCreationChecklistData["overallAssessment"] })} options={[
          { value: "FULLY_VALIDATED", label: "Fully Validated" }, { value: "PARTIALLY_VALIDATED", label: "Partially Validated" }, { value: "NOT_VALIDATED", label: "Not Validated" },
        ]} />
        <FormField type="textarea" label="Assessment Reason" value={data.assessmentReason} onChange={(v) => update({ assessmentReason: v })} />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Created By (Consultant ID)" value={data.createdBy} onChange={(v) => update({ createdBy: v })} />
          <FormField type="text" label="Checked By (Checker ID)" value={data.checkedBy} onChange={(v) => update({ checkedBy: v })} />
        </div>
      </FormSection>
    </div>
  );
}
