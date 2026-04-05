import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { InitialConsultationData } from "../../types";

const DEFAULTS: InitialConsultationData = {
  companyName: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  date: new Date().toISOString().slice(0, 10),
  consultant: "",
  estimatedTotalAssets: 0,
  digitalAssetProportion: 0,
  existingAssets: { cryptocurrencies: false, nfts: false, tokenizedAssets: false, cloudAssets: false },
  maritalStatus: "",
  childrenCount: 0,
  existingArrangements: { will: false, inheritanceContract: false, livingWill: false, powerOfAttorney: false },
  custodyMethod: "",
  documentationStatus: "",
  primaryGoals: "",
  desiredServices: "",
  timeframe: "",
};

export function InitialConsultation() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["initial-consultation"].data as Partial<InitialConsultationData>) };

  const update = (partial: Partial<InitialConsultationData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "initial-consultation", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.companyName} value={data.companyName} onChange={(v) => update({ companyName: v })} required />
          <FormField type="text" label={t.fields.contactPerson} value={data.contactPerson} onChange={(v) => update({ contactPerson: v })} required />
          <FormField type="email" label={t.fields.contactEmail} value={data.contactEmail} onChange={(v) => update({ contactEmail: v })} required />
          <FormField type="text" label={t.fields.contactPhone} value={data.contactPhone} onChange={(v) => update({ contactPhone: v })} />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} required />
          <FormField type="text" label={t.fields.consultant} value={data.consultant} onChange={(v) => update({ consultant: v })} required />
        </div>
      </FormSection>

      <FormSection title={t.sections.assetStructure}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="number" label={t.fields.estimatedTotalAssets} value={data.estimatedTotalAssets} onChange={(v) => update({ estimatedTotalAssets: Number(v) })} required />
          <FormField type="number" label={t.fields.digitalAssetProportion} value={data.digitalAssetProportion} onChange={(v) => update({ digitalAssetProportion: Number(v) })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.existingDigitalAssets}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="checkbox" label={t.fields.cryptocurrencies} checked={data.existingAssets.cryptocurrencies} onChange={(c) => update({ existingAssets: { ...data.existingAssets, cryptocurrencies: c } })} />
          <FormField type="checkbox" label={t.fields.nfts} checked={data.existingAssets.nfts} onChange={(c) => update({ existingAssets: { ...data.existingAssets, nfts: c } })} />
          <FormField type="checkbox" label={t.fields.tokenizedAssets} checked={data.existingAssets.tokenizedAssets} onChange={(c) => update({ existingAssets: { ...data.existingAssets, tokenizedAssets: c } })} />
          <FormField type="checkbox" label={t.fields.cloudAssets} checked={data.existingAssets.cloudAssets} onChange={(c) => update({ existingAssets: { ...data.existingAssets, cloudAssets: c } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.familyStructure}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.maritalStatus} value={data.maritalStatus} onChange={(v) => update({ maritalStatus: v })} options={[
            { value: "single", label: "Single" },
            { value: "married", label: "Married" },
            { value: "divorced", label: "Divorced" },
            { value: "widowed", label: "Widowed" },
            { value: "partnership", label: "Registered Partnership" },
          ]} />
          <FormField type="number" label={t.fields.childrenCount} value={data.childrenCount} onChange={(v) => update({ childrenCount: Number(v) })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.existingArrangements}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="checkbox" label={t.fields.will} checked={data.existingArrangements.will} onChange={(c) => update({ existingArrangements: { ...data.existingArrangements, will: c } })} />
          <FormField type="checkbox" label={t.fields.inheritanceContract} checked={data.existingArrangements.inheritanceContract} onChange={(c) => update({ existingArrangements: { ...data.existingArrangements, inheritanceContract: c } })} />
          <FormField type="checkbox" label={t.fields.livingWill} checked={data.existingArrangements.livingWill} onChange={(c) => update({ existingArrangements: { ...data.existingArrangements, livingWill: c } })} />
          <FormField type="checkbox" label={t.fields.powerOfAttorney} checked={data.existingArrangements.powerOfAttorney} onChange={(c) => update({ existingArrangements: { ...data.existingArrangements, powerOfAttorney: c } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.existingInfrastructure}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.custodyMethod} value={data.custodyMethod} onChange={(v) => update({ custodyMethod: v })} options={[
            { value: "hardware", label: "Hardware Wallet" },
            { value: "software", label: "Software Wallet" },
            { value: "custody", label: "Custody Solution" },
            { value: "self", label: "Self-Custody" },
            { value: "mixed", label: "Mixed" },
          ]} />
          <FormField type="select" label={t.fields.documentationStatus} value={data.documentationStatus} onChange={(v) => update({ documentationStatus: v })} options={[
            { value: "full", label: "Fully Documented" },
            { value: "partial", label: "Partially Documented" },
            { value: "none", label: "Not Documented" },
          ]} />
        </div>
      </FormSection>

      <FormSection title={t.sections.goalsExpectations}>
        <FormField type="textarea" label={t.fields.primaryGoals} value={data.primaryGoals} onChange={(v) => update({ primaryGoals: v })} />
        <FormField type="textarea" label={t.fields.desiredServices} value={data.desiredServices} onChange={(v) => update({ desiredServices: v })} />
        <FormField type="text" label={t.fields.timeframe} value={data.timeframe} onChange={(v) => update({ timeframe: v })} />
      </FormSection>
    </div>
  );
}
