import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { EscalationPathData } from "../../types";

const DEFAULT_LEVELS = [
  { level: 0, name: "Standard", trigger: "Normal operations", responsibility: "", responseTime: "24 hours", channels: "Email, Phone", action: "Standard processing" },
  { level: 1, name: "First Escalation", trigger: "No response within Level 0", responsibility: "", responseTime: "4 hours", channels: "Email, Phone, SMS", action: "Takeover and accelerated processing" },
  { level: 2, name: "Second Escalation", trigger: "No response within Level 1", responsibility: "", responseTime: "2 hours", channels: "All available", action: "Direct intervention" },
  { level: 3, name: "Third Escalation", trigger: "Critical situation", responsibility: "", responseTime: "1 hour", channels: "Direct, Personal", action: "Highest-level decision" },
  { level: 4, name: "External Escalation", trigger: "Authority request / Legal dispute", responsibility: "", responseTime: "Immediately", channels: "Written, Lawyer", action: "Legal steering" },
];

const DEFAULT_CONTACTS = [
  { role: "Primary Consultant", name: "", phone: "", email: "", availability: "" },
  { role: "Team Leader", name: "", phone: "", email: "", availability: "" },
  { role: "Department Head", name: "", phone: "", email: "", availability: "" },
  { role: "Management", name: "", phone: "", email: "", availability: "" },
  { role: "Legal Department / Lawyer", name: "", phone: "", email: "", availability: "" },
];

const DEFAULTS: EscalationPathData = {
  containerId: "", clientName: "", validFrom: new Date().toISOString().slice(0, 10),
  levels: DEFAULT_LEVELS, contacts: DEFAULT_CONTACTS, exceptions: "",
};

export function EscalationPath() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["escalation-path"].data as Partial<EscalationPathData>) };

  const update = (partial: Partial<EscalationPathData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "escalation-path", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} required />
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="date" label={t.fields.validFrom} value={data.validFrom} onChange={(v) => update({ validFrom: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.escalationLevels}>
        {data.levels.map((level, i) => (
          <div key={i} className={`p-3 rounded-lg space-y-3 ${i === 0 ? "bg-green-50" : i <= 2 ? "bg-amber-50" : "bg-red-50"} dark:bg-muted`}>
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Level {level.level} — {level.name}</span>
              {data.levels.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => update({ levels: data.levels.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField type="text" label={t.fields.trigger} value={level.trigger} onChange={(v) => { const arr = [...data.levels]; arr[i] = { ...arr[i], trigger: v }; update({ levels: arr }); }} />
              <FormField type="text" label={t.fields.responsibility} value={level.responsibility} onChange={(v) => { const arr = [...data.levels]; arr[i] = { ...arr[i], responsibility: v }; update({ levels: arr }); }} />
              <FormField type="text" label={t.fields.responseTime} value={level.responseTime} onChange={(v) => { const arr = [...data.levels]; arr[i] = { ...arr[i], responseTime: v }; update({ levels: arr }); }} />
              <FormField type="text" label={t.fields.channel} value={level.channels} onChange={(v) => { const arr = [...data.levels]; arr[i] = { ...arr[i], channels: v }; update({ levels: arr }); }} />
            </div>
            <FormField type="text" label={t.fields.action} value={level.action} onChange={(v) => { const arr = [...data.levels]; arr[i] = { ...arr[i], action: v }; update({ levels: arr }); }} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ levels: [...data.levels, { level: data.levels.length, name: "", trigger: "", responsibility: "", responseTime: "", channels: "", action: "" }] })}>
          <Plus className="w-4 h-4 mr-2" /> Add Level
        </Button>
      </FormSection>

      <FormSection title={t.sections.contactChain}>
        {data.contacts.map((contact, i) => (
          <div key={i} className="grid md:grid-cols-5 gap-3 pb-2">
            <FormField type="text" label="Role" value={contact.role} onChange={(v) => { const arr = [...data.contacts]; arr[i] = { ...arr[i], role: v }; update({ contacts: arr }); }} />
            <FormField type="text" label={t.fields.name} value={contact.name} onChange={(v) => { const arr = [...data.contacts]; arr[i] = { ...arr[i], name: v }; update({ contacts: arr }); }} />
            <FormField type="text" label={t.fields.phone} value={contact.phone} onChange={(v) => { const arr = [...data.contacts]; arr[i] = { ...arr[i], phone: v }; update({ contacts: arr }); }} />
            <FormField type="email" label={t.fields.email} value={contact.email} onChange={(v) => { const arr = [...data.contacts]; arr[i] = { ...arr[i], email: v }; update({ contacts: arr }); }} />
            <FormField type="text" label="Availability" value={contact.availability} onChange={(v) => { const arr = [...data.contacts]; arr[i] = { ...arr[i], availability: v }; update({ contacts: arr }); }} />
          </div>
        ))}
      </FormSection>

      <FormSection title="Exceptions and Special Features">
        <FormField type="textarea" label="Exceptions" value={data.exceptions} onChange={(v) => update({ exceptions: v })} placeholder="Special circumstances, holidays, vacation times, etc." />
      </FormSection>
    </div>
  );
}
