import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { ContainerStructureData, HeirEntry } from "../../types";

const EMPTY_HEIR: HeirEntry = { name: "", dateOfBirth: "", relationship: "", address: "", contactPhone: "", contactEmail: "", sharePercent: 0, conditions: "" };

const DEFAULTS: ContainerStructureData = {
  containerId: "", createdOn: new Date().toISOString().slice(0, 10), lastModified: "", version: "1.0", status: "ACTIVE",
  ownerName: "", ownerDateOfBirth: "", ownerPlaceOfBirth: "", ownerAddress: "", ownerTaxId: "", ownerNationality: "",
  assetSummary: { walletCount: 0, totalCryptoValueEur: 0, btcAmount: "", ethAmount: "", nftCount: 0, nftTotalValueEur: 0, cloudAccountCount: 0, otherDigitalAssets: "" },
  primaryHeir: { ...EMPTY_HEIR }, secondaryHeir: { ...EMPTY_HEIR }, additionalHeirs: [],
  primaryTrigger: "Death of Asset Owner", secondaryTrigger: "", periodAfterTrigger: "",
  distributionInstructions: "", specialConditions: "",
  contacts: {
    primaryContact: { name: "", phone: "", email: "" }, secondaryContact: { name: "", phone: "", email: "" },
    notary: { name: "", phone: "", email: "" }, lawyer: { name: "", phone: "", email: "" }, taxAdvisor: { name: "", phone: "", email: "" },
  },
  containerHash: "", previousHash: "", validatorId: "", legacyProofId: "", nextValidationDate: "",
};

export function ContainerStructure() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["container-structure"].data as Partial<ContainerStructureData>) };

  const update = (partial: Partial<ContainerStructureData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "container-structure", data: partial });
  };

  const renderHeirFields = (heir: HeirEntry, label: string, onChange: (h: HeirEntry) => void) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{label}</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField type="text" label={t.fields.name} value={heir.name} onChange={(v) => onChange({ ...heir, name: v })} required />
        <FormField type="date" label={t.fields.dateOfBirth} value={heir.dateOfBirth} onChange={(v) => onChange({ ...heir, dateOfBirth: v })} />
        <FormField type="text" label={t.fields.relationship} value={heir.relationship} onChange={(v) => onChange({ ...heir, relationship: v })} />
        <FormField type="text" label={t.fields.address} value={heir.address} onChange={(v) => onChange({ ...heir, address: v })} />
        <FormField type="text" label={t.fields.phone} value={heir.contactPhone} onChange={(v) => onChange({ ...heir, contactPhone: v })} />
        <FormField type="email" label={t.fields.email} value={heir.contactEmail} onChange={(v) => onChange({ ...heir, contactEmail: v })} />
        <FormField type="number" label={t.fields.sharePercent} value={heir.sharePercent} onChange={(v) => onChange({ ...heir, sharePercent: Number(v) })} />
        <FormField type="text" label={t.fields.conditions} value={heir.conditions} onChange={(v) => onChange({ ...heir, conditions: v })} />
      </div>
    </div>
  );

  const renderContactFields = (contact: { name: string; phone: string; email: string }, label: string, key: keyof ContainerStructureData["contacts"]) => (
    <div className="grid md:grid-cols-3 gap-3">
      <FormField type="text" label={`${label} — ${t.fields.name}`} value={contact.name} onChange={(v) => update({ contacts: { ...data.contacts, [key]: { ...contact, name: v } } })} />
      <FormField type="text" label={t.fields.phone} value={contact.phone} onChange={(v) => update({ contacts: { ...data.contacts, [key]: { ...contact, phone: v } } })} />
      <FormField type="email" label={t.fields.email} value={contact.email} onChange={(v) => update({ contacts: { ...data.contacts, [key]: { ...contact, email: v } } })} />
    </div>
  );

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.containerIdentification}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} required placeholder="YYYY-SERIAL" />
          <FormField type="date" label="Created On" value={data.createdOn} onChange={(v) => update({ createdOn: v })} />
          <FormField type="text" label={t.fields.version} value={data.version} onChange={(v) => update({ version: v })} />
          <FormField type="select" label={t.fields.status} value={data.status} onChange={(v) => update({ status: v as ContainerStructureData["status"] })} options={[
            { value: "ACTIVE", label: "Active" }, { value: "LOCKED", label: "Locked" }, { value: "ARCHIVED", label: "Archived" },
          ]} />
        </div>
      </FormSection>

      <FormSection title={t.sections.assetOwner}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.ownerName} value={data.ownerName} onChange={(v) => update({ ownerName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.ownerDateOfBirth} onChange={(v) => update({ ownerDateOfBirth: v })} required />
          <FormField type="text" label={t.fields.placeOfBirth} value={data.ownerPlaceOfBirth} onChange={(v) => update({ ownerPlaceOfBirth: v })} />
          <FormField type="text" label={t.fields.address} value={data.ownerAddress} onChange={(v) => update({ ownerAddress: v })} />
          <FormField type="text" label={t.fields.taxId} value={data.ownerTaxId} onChange={(v) => update({ ownerTaxId: v })} />
          <FormField type="text" label={t.fields.nationality} value={data.ownerNationality} onChange={(v) => update({ ownerNationality: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.assetReferences}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="number" label="Documented Wallets" value={data.assetSummary.walletCount} onChange={(v) => update({ assetSummary: { ...data.assetSummary, walletCount: Number(v) } })} />
          <FormField type="number" label="Total Crypto Value (EUR)" value={data.assetSummary.totalCryptoValueEur} onChange={(v) => update({ assetSummary: { ...data.assetSummary, totalCryptoValueEur: Number(v) } })} />
          <FormField type="text" label="BTC Amount" value={data.assetSummary.btcAmount} onChange={(v) => update({ assetSummary: { ...data.assetSummary, btcAmount: v } })} />
          <FormField type="text" label="ETH Amount" value={data.assetSummary.ethAmount} onChange={(v) => update({ assetSummary: { ...data.assetSummary, ethAmount: v } })} />
          <FormField type="number" label="NFT Count" value={data.assetSummary.nftCount} onChange={(v) => update({ assetSummary: { ...data.assetSummary, nftCount: Number(v) } })} />
          <FormField type="number" label="Cloud Accounts" value={data.assetSummary.cloudAccountCount} onChange={(v) => update({ assetSummary: { ...data.assetSummary, cloudAccountCount: Number(v) } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.heirs}>
        {renderHeirFields(data.primaryHeir, t.fields.primaryHeir, (h) => update({ primaryHeir: h }))}
        <Separator className="my-4" />
        {renderHeirFields(data.secondaryHeir, t.fields.secondaryHeir, (h) => update({ secondaryHeir: h }))}
        {data.additionalHeirs.map((heir, i) => (
          <div key={i}>
            <Separator className="my-4" />
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Additional Heir {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => update({ additionalHeirs: data.additionalHeirs.filter((_, idx) => idx !== i) })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {renderHeirFields(heir, `Heir ${i + 3}`, (h) => { const arr = [...data.additionalHeirs]; arr[i] = h; update({ additionalHeirs: arr }); })}
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-4" onClick={() => update({ additionalHeirs: [...data.additionalHeirs, { ...EMPTY_HEIR }] })}>
          <Plus className="w-4 h-4 mr-2" /> Add Heir
        </Button>
      </FormSection>

      <FormSection title={t.sections.successionConditions}>
        <FormField type="text" label={t.fields.primaryTrigger} value={data.primaryTrigger} onChange={(v) => update({ primaryTrigger: v })} />
        <FormField type="text" label={t.fields.secondaryTrigger} value={data.secondaryTrigger} onChange={(v) => update({ secondaryTrigger: v })} />
        <FormField type="text" label="Period After Trigger" value={data.periodAfterTrigger} onChange={(v) => update({ periodAfterTrigger: v })} placeholder="e.g. 30 days" />
        <FormField type="textarea" label={t.fields.distributionInstructions} value={data.distributionInstructions} onChange={(v) => update({ distributionInstructions: v })} />
        <FormField type="textarea" label={t.fields.specialConditions} value={data.specialConditions} onChange={(v) => update({ specialConditions: v })} />
      </FormSection>

      <FormSection title={t.sections.contactsInheritance}>
        {renderContactFields(data.contacts.primaryContact, "Primary Contact", "primaryContact")}
        <Separator className="my-3" />
        {renderContactFields(data.contacts.secondaryContact, "Secondary Contact", "secondaryContact")}
        <Separator className="my-3" />
        {renderContactFields(data.contacts.notary, t.fields.notary, "notary")}
        <Separator className="my-3" />
        {renderContactFields(data.contacts.lawyer, t.fields.lawyer, "lawyer")}
        <Separator className="my-3" />
        {renderContactFields(data.contacts.taxAdvisor, t.fields.taxAdvisor, "taxAdvisor")}
      </FormSection>

      <FormSection title={t.sections.containerIntegrity}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.containerHash} value={data.containerHash} onChange={(v) => update({ containerHash: v })} />
          <FormField type="text" label={t.fields.previousHash} value={data.previousHash} onChange={(v) => update({ previousHash: v })} />
          <FormField type="text" label={t.fields.validatorId} value={data.validatorId} onChange={(v) => update({ validatorId: v })} />
          <FormField type="text" label={t.fields.legacyProofId} value={data.legacyProofId} onChange={(v) => update({ legacyProofId: v })} />
          <FormField type="date" label={t.fields.nextValidationDate} value={data.nextValidationDate} onChange={(v) => update({ nextValidationDate: v })} />
        </div>
      </FormSection>
    </div>
  );
}
