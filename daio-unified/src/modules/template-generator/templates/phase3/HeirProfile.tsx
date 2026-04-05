import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import type { HeirProfileData } from "../../types";

const DEFAULTS: HeirProfileData = {
  assetOwner: "", heirNumber: 1, profileId: "",
  firstName: "", lastName: "", dateOfBirth: "", placeOfBirth: "",
  nationality: "", currentAddress: "", phone: "", email: "",
  relationshipType: "", relationshipSince: "",
  entitlementType: "PRIMARY", sharePercent: 100, prerequisites: "",
  preferredContactMethod: "EMAIL", alternativeContactMethod: "",
  isMinor: false, underGuardianship: false, abroad: false,
  identityProofType: "", identityProofNumber: "", identityProofDate: "",
  relationshipProof: "", bankName: "", iban: "", specialWishes: "", signatureDate: "",
};

export function HeirProfile() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["heir-profile"].data as Partial<HeirProfileData>) };

  const update = (partial: Partial<HeirProfileData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "heir-profile", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label="Asset Owner" value={data.assetOwner} onChange={(v) => update({ assetOwner: v })} required />
          <FormField type="number" label={t.fields.heirNumber} value={data.heirNumber} onChange={(v) => update({ heirNumber: Number(v) })} />
          <FormField type="text" label={t.fields.profileId} value={data.profileId} onChange={(v) => update({ profileId: v })} placeholder="CONTAINER-ID-HEIR-X" />
        </div>
      </FormSection>

      <FormSection title={t.sections.personalData}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.firstName} value={data.firstName} onChange={(v) => update({ firstName: v })} required />
          <FormField type="text" label={t.fields.lastName} value={data.lastName} onChange={(v) => update({ lastName: v })} required />
          <FormField type="date" label={t.fields.dateOfBirth} value={data.dateOfBirth} onChange={(v) => update({ dateOfBirth: v })} required />
          <FormField type="text" label={t.fields.placeOfBirth} value={data.placeOfBirth} onChange={(v) => update({ placeOfBirth: v })} />
          <FormField type="text" label={t.fields.nationality} value={data.nationality} onChange={(v) => update({ nationality: v })} />
          <FormField type="text" label={t.fields.address} value={data.currentAddress} onChange={(v) => update({ currentAddress: v })} />
          <FormField type="text" label={t.fields.phone} value={data.phone} onChange={(v) => update({ phone: v })} />
          <FormField type="email" label={t.fields.email} value={data.email} onChange={(v) => update({ email: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.relationshipInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.relationship} value={data.relationshipType} onChange={(v) => update({ relationshipType: v })} options={[
            { value: "SPOUSE", label: "Spouse" }, { value: "CHILD", label: "Child" }, { value: "GRANDCHILD", label: "Grandchild" },
            { value: "SIBLING", label: "Sibling" }, { value: "OTHER", label: "Other" },
          ]} />
          <FormField type="text" label="Relationship Since (Year)" value={data.relationshipSince} onChange={(v) => update({ relationshipSince: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.entitlementStatus}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.entitlementType} value={data.entitlementType} onChange={(v) => update({ entitlementType: v as HeirProfileData["entitlementType"] })} options={[
            { value: "PRIMARY", label: "Primary" }, { value: "SECONDARY", label: "Secondary" }, { value: "CONDITIONAL", label: "Conditional" },
          ]} />
          <FormField type="number" label={t.fields.sharePercent} value={data.sharePercent} onChange={(v) => update({ sharePercent: Number(v) })} />
        </div>
        <FormField type="text" label={t.fields.prerequisites} value={data.prerequisites} onChange={(v) => update({ prerequisites: v })} placeholder="e.g. Coming of age, specific condition" />
      </FormSection>

      <FormSection title={t.sections.contactInheritance}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.preferredContactMethod} value={data.preferredContactMethod} onChange={(v) => update({ preferredContactMethod: v as HeirProfileData["preferredContactMethod"] })} options={[
            { value: "PHONE", label: "Phone" }, { value: "EMAIL", label: "Email" }, { value: "LETTER", label: "Letter" },
          ]} />
          <FormField type="text" label="Alternative Contact Method" value={data.alternativeContactMethod} onChange={(v) => update({ alternativeContactMethod: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.specialCircumstances}>
        <div className="space-y-2">
          <FormField type="checkbox" label={t.fields.isMinor} checked={data.isMinor} onChange={(c) => update({ isMinor: c })} />
          <FormField type="checkbox" label={t.fields.underGuardianship} checked={data.underGuardianship} onChange={(c) => update({ underGuardianship: c })} />
          <FormField type="checkbox" label={t.fields.abroad} checked={data.abroad} onChange={(c) => update({ abroad: c })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.documentationRights}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="select" label={t.fields.identityProofType} value={data.identityProofType} onChange={(v) => update({ identityProofType: v })} options={[
            { value: "PASSPORT", label: "Passport" }, { value: "ID_CARD", label: "ID Card" }, { value: "DRIVERS_LICENSE", label: "Driver's License" },
          ]} />
          <FormField type="text" label={t.fields.identityProofNumber} value={data.identityProofNumber} onChange={(v) => update({ identityProofNumber: v })} />
          <FormField type="date" label={t.fields.identityProofDate} value={data.identityProofDate} onChange={(v) => update({ identityProofDate: v })} />
          <FormField type="text" label={t.fields.relationshipProof} value={data.relationshipProof} onChange={(v) => update({ relationshipProof: v })} placeholder="Birth Certificate / Marriage Certificate" />
          <FormField type="text" label={t.fields.bankName} value={data.bankName} onChange={(v) => update({ bankName: v })} />
          <FormField type="text" label={t.fields.iban} value={data.iban} onChange={(v) => update({ iban: v })} />
        </div>
      </FormSection>

      <FormSection title="Additional Information">
        <FormField type="textarea" label={t.fields.specialWishes} value={data.specialWishes} onChange={(v) => update({ specialWishes: v })} />
        <FormField type="date" label={t.fields.signatureDate} value={data.signatureDate} onChange={(v) => update({ signatureDate: v })} />
      </FormSection>
    </div>
  );
}
