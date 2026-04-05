import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivationCommunicationData } from "../../types";

const DEFAULTS: ActivationCommunicationData = {
  date: new Date().toISOString().slice(0, 10), recipientName: "", recipientAddress: "",
  assetOwner: "", eventDate: "", eventType: "death",
  relationship: "", containerId: "",
  consultantName: "", consultantPhone: "", consultantEmail: "", officeHours: "",
};

export function ActivationCommunication() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["activation-communication"].data as Partial<ActivationCommunicationData>) };

  const update = (partial: Partial<ActivationCommunicationData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "activation-communication", data: partial });
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm">
        <p className="font-medium text-red-800 dark:text-red-300">CONFIDENTIAL</p>
        <p className="text-red-700 dark:text-red-400 mt-1">This communication template is activated when a succession event occurs. Fill in the fields and adapt the text as needed.</p>
      </div>

      <FormSection title="Communication Details">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
          <FormField type="text" label={t.fields.recipientName} value={data.recipientName} onChange={(v) => update({ recipientName: v })} required />
          <FormField type="text" label={t.fields.recipientAddress} value={data.recipientAddress} onChange={(v) => update({ recipientAddress: v })} />
        </div>
      </FormSection>

      <FormSection title="Event Information">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Asset Owner" value={data.assetOwner} onChange={(v) => update({ assetOwner: v })} required />
          <FormField type="date" label={t.fields.eventDate} value={data.eventDate} onChange={(v) => update({ eventDate: v })} />
          <FormField type="select" label={t.fields.eventType} value={data.eventType} onChange={(v) => update({ eventType: v })} options={[
            { value: "death", label: "Death" }, { value: "incapacity", label: "Incapacity" }, { value: "other", label: "Other" },
          ]} />
          <FormField type="text" label={t.fields.relationship} value={data.relationship} onChange={(v) => update({ relationship: v })} />
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} />
        </div>
      </FormSection>

      <FormSection title="Consultant Contact">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Consultant Name" value={data.consultantName} onChange={(v) => update({ consultantName: v })} />
          <FormField type="text" label={t.fields.phone} value={data.consultantPhone} onChange={(v) => update({ consultantPhone: v })} />
          <FormField type="email" label={t.fields.email} value={data.consultantEmail} onChange={(v) => update({ consultantEmail: v })} />
          <FormField type="text" label={t.fields.officeHours} value={data.officeHours} onChange={(v) => update({ officeHours: v })} />
        </div>
      </FormSection>

      <Card className="bg-muted">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Letter Preview</h3>
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">CONFIDENTIAL</p>
            <p>{data.date}</p>
            <p>{data.recipientName}<br />{data.recipientAddress}</p>
            <p className="font-medium">Subject: Important Notification Regarding the Estate of {data.assetOwner || "[ASSET OWNER]"}</p>
            <p>Dear {data.recipientName || "[NAME]"},</p>
            <p>We regret to inform you that {data.assetOwner || "[ASSET OWNER]"} {data.eventType === "death" ? `passed away on ${data.eventDate || "[DATE]"}` : `requires succession services as of ${data.eventDate || "[DATE]"}`}.</p>
            <p>As {data.relationship || "[RELATIONSHIP]"} of the deceased, you are designated as heir in the Inheritance Container (Ref: {data.containerId || "[CONTAINER-ID]"}).</p>
            <p className="font-medium">Your Next Steps:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Confirmation of identity and entitlement verification</li>
              <li>Review of documented digital assets</li>
              <li>Determination of transfer modalities</li>
            </ol>
            <p className="font-medium mt-3">Required Documents:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Copy of valid ID document</li>
              <li>Proof of relationship</li>
            </ul>
            <p className="mt-3">Your personal contact: {data.consultantName || "[CONSULTANT]"}<br />
              Phone: {data.consultantPhone || "[PHONE]"}<br />
              Email: {data.consultantEmail || "[EMAIL]"}<br />
              Office Hours: {data.officeHours || "[HOURS]"}</p>
            <p className="text-xs text-muted-foreground mt-4 italic">Please do not send sensitive information via unencrypted email. We will provide a secure communication channel.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
