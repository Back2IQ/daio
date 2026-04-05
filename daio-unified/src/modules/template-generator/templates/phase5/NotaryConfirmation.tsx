import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { NotaryConfirmationData } from "../../types";

const DEFAULTS: NotaryConfirmationData = {
  transferId: "", containerId: "", requestDate: new Date().toISOString().slice(0, 10),
  notaryName: "", officeAddress: "", officialSeat: "",
  ownerName: "", ownerDateOfBirth: "", ownerDeathDate: "",
  heirName: "", heirDateOfBirth: "", inheritanceDocDate: "",
  assetDescription: "", walletAddress: "", estimatedValueEur: 0,
  legalBasis: "WILL", legalBasisDate: "",
  identityVerified: false, entitlementProven: false, noObstaclesKnown: false, transferCanExecute: false,
  notaryId: "", feesEur: 0,
};

export function NotaryConfirmation() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["notary-confirmation"].data as Partial<NotaryConfirmationData>) };

  const update = (partial: Partial<NotaryConfirmationData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "notary-confirmation", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title="Transfer Reference">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.transferId} value={data.transferId} onChange={(v) => update({ transferId: v })} required />
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} required />
          <FormField type="date" label={t.fields.requestDate} value={data.requestDate} onChange={(v) => update({ requestDate: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.notaryConfirmation}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Notary Name" value={data.notaryName} onChange={(v) => update({ notaryName: v })} required />
          <FormField type="text" label="Office Address" value={data.officeAddress} onChange={(v) => update({ officeAddress: v })} />
          <FormField type="text" label="Official Seat" value={data.officialSeat} onChange={(v) => update({ officialSeat: v })} />
        </div>
      </FormSection>

      <FormSection title="Asset Owner (Deceased)">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.name} value={data.ownerName} onChange={(v) => update({ ownerName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.ownerDateOfBirth} onChange={(v) => update({ ownerDateOfBirth: v })} />
          <FormField type="date" label="Death Date" value={data.ownerDeathDate} onChange={(v) => update({ ownerDeathDate: v })} />
        </div>
      </FormSection>

      <FormSection title="Heir">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.name} value={data.heirName} onChange={(v) => update({ heirName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.heirDateOfBirth} onChange={(v) => update({ heirDateOfBirth: v })} />
          <FormField type="date" label="Inheritance Doc Date" value={data.inheritanceDocDate} onChange={(v) => update({ inheritanceDocDate: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.transferObject}>
        <FormField type="textarea" label="Asset Description" value={data.assetDescription} onChange={(v) => update({ assetDescription: v })} />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.walletAddress} value={data.walletAddress} onChange={(v) => update({ walletAddress: v })} />
          <FormField type="number" label="Estimated Value (EUR)" value={data.estimatedValueEur} onChange={(v) => update({ estimatedValueEur: Number(v) })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.legalBasis}>
        <FormField type="select" label="Legal Basis" value={data.legalBasis} onChange={(v) => update({ legalBasis: v as NotaryConfirmationData["legalBasis"] })} options={[
          { value: "WILL", label: "Will" }, { value: "INHERITANCE_CONTRACT", label: "Inheritance Contract" }, { value: "LEGAL_INHERITANCE", label: "Legal Inheritance" },
        ]} />
        <FormField type="date" label="Legal Basis Date" value={data.legalBasisDate} onChange={(v) => update({ legalBasisDate: v })} />
      </FormSection>

      <FormSection title="Confirmation Points">
        <div className="space-y-2">
          <FormField type="checkbox" label="Identity of heir verified by valid documents" checked={data.identityVerified} onChange={(c) => update({ identityVerified: c })} />
          <FormField type="checkbox" label="Entitlement proven" checked={data.entitlementProven} onChange={(c) => update({ entitlementProven: c })} />
          <FormField type="checkbox" label="No obstacles to transfer known" checked={data.noObstaclesKnown} onChange={(c) => update({ noObstaclesKnown: c })} />
          <FormField type="checkbox" label="Transfer can be executed per Container instructions" checked={data.transferCanExecute} onChange={(c) => update({ transferCanExecute: c })} />
        </div>
      </FormSection>

      <FormSection title="Notary Signature">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.notaryId} value={data.notaryId} onChange={(v) => update({ notaryId: v })} />
          <FormField type="number" label={t.fields.feesEur} value={data.feesEur} onChange={(v) => update({ feesEur: Number(v) })} />
        </div>
      </FormSection>
    </div>
  );
}
