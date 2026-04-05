import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import type { ProofCertificateData } from "../../types";

const DEFAULTS: ProofCertificateData = {
  certificateNumber: "", issuanceDate: new Date().toISOString().slice(0, 10), validUntil: "",
  ownerFirstName: "", ownerLastName: "", ownerDateOfBirth: "", ownerResidence: "",
  containerId: "", containerCreationDate: "", documentedAssetCount: 0, heirCount: 0,
  validationPoints: { identityVerified: false, heirsDocumented: false, assetsVerified: false, legalBasisChecked: false, technicalIntegrityConfirmed: false, documentationValidated: false },
  containerHash: "", validatorId: "", checksum: "", consultantName: "", qualifications: "",
};

export function ProofCertificate() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["proof-certificate"].data as Partial<ProofCertificateData>) };

  const update = (partial: Partial<ProofCertificateData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "proof-certificate", data: partial });
  };

  const allValidated = Object.values(data.validationPoints).every(Boolean);

  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-4 text-sm flex items-center gap-3 ${allValidated ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
        <Shield className={`w-6 h-6 ${allValidated ? "text-green-600" : "text-amber-600"}`} />
        <div>
          <p className="font-medium">{allValidated ? "All Validation Points Confirmed" : "Pending Validation Points"}</p>
          <p className="text-xs mt-1 opacity-75">Certificate validity: 12 months from issuance. Invalid upon material Container changes.</p>
        </div>
      </div>

      <FormSection title="Certificate Information">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.certificateNumber} value={data.certificateNumber} onChange={(v) => update({ certificateNumber: v })} required placeholder="LP-YYYY-NUMBER" />
          <FormField type="date" label={t.fields.issuanceDate} value={data.issuanceDate} onChange={(v) => update({ issuanceDate: v })} />
          <FormField type="date" label={t.fields.validUntil} value={data.validUntil} onChange={(v) => update({ validUntil: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.assetOwner}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.firstName} value={data.ownerFirstName} onChange={(v) => update({ ownerFirstName: v })} required />
          <FormField type="text" label={t.fields.lastName} value={data.ownerLastName} onChange={(v) => update({ ownerLastName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.ownerDateOfBirth} onChange={(v) => update({ ownerDateOfBirth: v })} />
          <FormField type="text" label="Residence" value={data.ownerResidence} onChange={(v) => update({ ownerResidence: v })} />
        </div>
      </FormSection>

      <FormSection title="Inheritance Container">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} />
          <FormField type="date" label="Creation Date" value={data.containerCreationDate} onChange={(v) => update({ containerCreationDate: v })} />
          <FormField type="number" label="Documented Assets" value={data.documentedAssetCount} onChange={(v) => update({ documentedAssetCount: Number(v) })} />
          <FormField type="number" label="Number of Heirs" value={data.heirCount} onChange={(v) => update({ heirCount: Number(v) })} />
        </div>
      </FormSection>

      <FormSection title="Confirmed Validation Points">
        <div className="space-y-2">
          {([
            ["identityVerified", "Identity of asset owner verified"],
            ["heirsDocumented", "Heirs identified and documented"],
            ["assetsVerified", "Assets verified and inventoried"],
            ["legalBasisChecked", "Legal basis checked"],
            ["technicalIntegrityConfirmed", "Technical integrity confirmed"],
            ["documentationValidated", "Completeness of documentation validated"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <FormField type="checkbox" label={label} checked={data.validationPoints[key]} onChange={(c) => update({ validationPoints: { ...data.validationPoints, [key]: c } })} />
              {data.validationPoints[key] && <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmed</Badge>}
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Integrity Evidence">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.containerHash} value={data.containerHash} onChange={(v) => update({ containerHash: v })} />
          <FormField type="text" label={t.fields.validatorId} value={data.validatorId} onChange={(v) => update({ validatorId: v })} />
          <FormField type="text" label="Checksum" value={data.checksum} onChange={(v) => update({ checksum: v })} />
        </div>
      </FormSection>

      <FormSection title="Issuer">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Consultant Name" value={data.consultantName} onChange={(v) => update({ consultantName: v })} />
          <FormField type="text" label="Qualifications" value={data.qualifications} onChange={(v) => update({ qualifications: v })} />
        </div>
      </FormSection>
    </div>
  );
}
