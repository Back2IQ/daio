import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { DigitalWillData } from "../../types";

const DEFAULTS: DigitalWillData = {
  assetOwner: "", birthDate: "", residenceAddress: "",
  willDate: new Date().toISOString().slice(0, 10), containerReference: "",
  formalWillDate: "", btcInstructions: "", ethInstructions: "",
  nftInstructions: "", otherAssetInstructions: "",
  estateAdministrator: "", costPaymentMethod: "From estate",
  lifetimeGifts: "NOT", signatureDate: "", signatureLocation: "",
};

export function DigitalWill() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["digital-will"].data as Partial<DigitalWillData>) };

  const update = (partial: Partial<DigitalWillData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "digital-will", data: partial });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-300">Important Notice</p>
        <p className="text-amber-700 dark:text-amber-400 mt-1">This template supplements a formal will. It does not replace legally binding testamentary documents. Consult a legal professional.</p>
      </div>

      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Asset Owner" value={data.assetOwner} onChange={(v) => update({ assetOwner: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.birthDate} onChange={(v) => update({ birthDate: v })} />
          <FormField type="text" label={t.fields.address} value={data.residenceAddress} onChange={(v) => update({ residenceAddress: v })} />
          <FormField type="date" label="Will Date" value={data.willDate} onChange={(v) => update({ willDate: v })} />
          <FormField type="text" label={t.fields.containerId} value={data.containerReference} onChange={(v) => update({ containerReference: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.preamble}>
        <FormField type="date" label={t.fields.formalWillDate} value={data.formalWillDate} onChange={(v) => update({ formalWillDate: v })} />
        <p className="text-sm text-muted-foreground">This document supplements the formal will and regulates the treatment of digital assets in the context of a complete succession plan.</p>
      </FormSection>

      <FormSection title={t.sections.assetInstructions}>
        <FormField type="textarea" label={t.fields.btcInstructions} value={data.btcInstructions} onChange={(v) => update({ btcInstructions: v })} placeholder="e.g. Total to primary heir / Distribution: 60% Heir A, 40% Heir B" />
        <FormField type="textarea" label={t.fields.ethInstructions} value={data.ethInstructions} onChange={(v) => update({ ethInstructions: v })} placeholder="e.g. Total to primary heir / Specific distribution" />
        <FormField type="textarea" label={t.fields.nftInstructions} value={data.nftInstructions} onChange={(v) => update({ nftInstructions: v })} placeholder="Instructions for individual NFTs or entire collection" />
        <FormField type="textarea" label={t.fields.otherAssetInstructions} value={data.otherAssetInstructions} onChange={(v) => update({ otherAssetInstructions: v })} placeholder="Detailed instructions for cloud accounts, domains, tokens, etc." />
      </FormSection>

      <FormSection title={t.sections.specialProvisions}>
        <FormField type="text" label={t.fields.estateAdministrator} value={data.estateAdministrator} onChange={(v) => update({ estateAdministrator: v })} placeholder="Named estate administrator with Container access" />
        <FormField type="text" label={t.fields.costPaymentMethod} value={data.costPaymentMethod} onChange={(v) => update({ costPaymentMethod: v })} />
        <FormField type="select" label={t.fields.lifetimeGifts} value={data.lifetimeGifts} onChange={(v) => update({ lifetimeGifts: v as DigitalWillData["lifetimeGifts"] })} options={[
          { value: "NOT", label: "Not Considered" },
          { value: "ACCORDINGLY", label: "Considered Accordingly" },
          { value: "OTHER", label: "Other Arrangement" },
        ]} />
      </FormSection>

      <FormSection title={t.sections.finalProvisions}>
        <p className="text-sm text-muted-foreground mb-4">This document takes effect upon death of the asset owner. It supplements but does not replace formal legal documents. It references the Inheritance Container for detailed asset records.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="date" label={t.fields.signatureDate} value={data.signatureDate} onChange={(v) => update({ signatureDate: v })} />
          <FormField type="text" label={t.fields.signatureLocation} value={data.signatureLocation} onChange={(v) => update({ signatureLocation: v })} />
        </div>
      </FormSection>
    </div>
  );
}
