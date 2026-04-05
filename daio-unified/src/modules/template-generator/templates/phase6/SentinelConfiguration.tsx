import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { SentinelConfigurationData } from "../../types";

const DEFAULTS: SentinelConfigurationData = {
  containerId: "", clientName: "", configuredBy: "", date: new Date().toISOString().slice(0, 10),
  monitoringMode: "ACTIVE",
  primaryTrigger: { type: "Death of Asset Owner", sources: { deathRegisters: true, newsMonitoring: true, insuranceNotification: false, familyNotification: false }, confirmationMode: "MANUAL", requiredSources: 2 },
  secondaryTriggers: [],
  notifications: {
    level1: { recipients: "Consultant, Team Leader", channel: "Email, SMS, App", timeframe: "Immediately (within 1 hour)" },
    level2: { recipients: "Primary Heir", channel: "Email, Phone, Letter", timeframe: "" },
    level3: { recipients: "Secondary Heir, Notary", channel: "All available", timeframe: "" },
    level4: { action: "", timeframe: "" },
  },
  timeframes: { confirmationWindowDays: 7, waitBeforeLevel2Hours: 24, waitBeforeLevel3Days: 7, waitBeforeLevel4Days: 14 },
  activatedOn: "", activatedBy: "", nextReview: "",
  configConfirmed: false, testRunCompleted: false, contactsInformed: false,
};

export function SentinelConfiguration() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["sentinel-configuration"].data as Partial<SentinelConfigurationData>) };

  const update = (partial: Partial<SentinelConfigurationData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "sentinel-configuration", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.containerId} value={data.containerId} onChange={(v) => update({ containerId: v })} required />
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="text" label="Configured By" value={data.configuredBy} onChange={(v) => update({ configuredBy: v })} />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
        </div>
        <FormField type="select" label={t.fields.monitoringMode} value={data.monitoringMode} onChange={(v) => update({ monitoringMode: v as SentinelConfigurationData["monitoringMode"] })} options={[
          { value: "ACTIVE", label: "ACTIVE — Full monitoring active" }, { value: "PAUSED", label: "PAUSED — Temporarily suspended" }, { value: "TEST", label: "TEST MODE — Simulated triggers" },
        ]} />
      </FormSection>

      <FormSection title={t.sections.triggerConfiguration}>
        <h4 className="font-medium text-sm mb-3">Primary Trigger</h4>
        <FormField type="text" label="Trigger Type" value={data.primaryTrigger.type} onChange={(v) => update({ primaryTrigger: { ...data.primaryTrigger, type: v } })} />
        <p className="text-sm text-muted-foreground mb-2">Monitoring Sources:</p>
        <div className="grid md:grid-cols-2 gap-2">
          <FormField type="checkbox" label="Official Death Registers" checked={data.primaryTrigger.sources.deathRegisters} onChange={(c) => update({ primaryTrigger: { ...data.primaryTrigger, sources: { ...data.primaryTrigger.sources, deathRegisters: c } } })} />
          <FormField type="checkbox" label="News Monitoring" checked={data.primaryTrigger.sources.newsMonitoring} onChange={(c) => update({ primaryTrigger: { ...data.primaryTrigger, sources: { ...data.primaryTrigger.sources, newsMonitoring: c } } })} />
          <FormField type="checkbox" label="Insurance Notification" checked={data.primaryTrigger.sources.insuranceNotification} onChange={(c) => update({ primaryTrigger: { ...data.primaryTrigger, sources: { ...data.primaryTrigger.sources, insuranceNotification: c } } })} />
          <FormField type="checkbox" label="Family Notification" checked={data.primaryTrigger.sources.familyNotification} onChange={(c) => update({ primaryTrigger: { ...data.primaryTrigger, sources: { ...data.primaryTrigger.sources, familyNotification: c } } })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <FormField type="select" label={t.fields.confirmationMode} value={data.primaryTrigger.confirmationMode} onChange={(v) => update({ primaryTrigger: { ...data.primaryTrigger, confirmationMode: v as "AUTOMATIC" | "MANUAL" } })} options={[
            { value: "AUTOMATIC", label: "Automatic" }, { value: "MANUAL", label: "Manual" },
          ]} />
          <FormField type="number" label={t.fields.requiredSources} value={data.primaryTrigger.requiredSources} onChange={(v) => update({ primaryTrigger: { ...data.primaryTrigger, requiredSources: Number(v) } })} />
        </div>

        <Separator className="my-4" />
        <h4 className="font-medium text-sm mb-3">Secondary Triggers</h4>
        {data.secondaryTriggers.map((trigger, i) => (
          <div key={i} className="flex gap-3 items-start mb-3">
            <div className="grid md:grid-cols-3 gap-3 flex-1">
              <FormField type="text" label="Type" value={trigger.type} onChange={(v) => { const arr = [...data.secondaryTriggers]; arr[i] = { ...arr[i], type: v }; update({ secondaryTriggers: arr }); }} />
              <FormField type="text" label="Definition" value={trigger.definition} onChange={(v) => { const arr = [...data.secondaryTriggers]; arr[i] = { ...arr[i], definition: v }; update({ secondaryTriggers: arr }); }} />
              <FormField type="text" label="Trigger" value={trigger.trigger} onChange={(v) => { const arr = [...data.secondaryTriggers]; arr[i] = { ...arr[i], trigger: v }; update({ secondaryTriggers: arr }); }} />
            </div>
            <Button variant="ghost" size="sm" className="mt-6" onClick={() => update({ secondaryTriggers: data.secondaryTriggers.filter((_, idx) => idx !== i) })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ secondaryTriggers: [...data.secondaryTriggers, { type: "", definition: "", trigger: "" }] })}>
          <Plus className="w-4 h-4 mr-2" /> Add Secondary Trigger
        </Button>
      </FormSection>

      <FormSection title={t.sections.notificationConfig}>
        {([
          ["Level 1 — Internal Notification", "level1", ["recipients", "channel", "timeframe"]],
          ["Level 2 — First Contact (Heir)", "level2", ["recipients", "channel", "timeframe"]],
          ["Level 3 — Case Escalation", "level3", ["recipients", "channel", "timeframe"]],
        ] as const).map(([label, key, fields]) => (
          <div key={key} className="space-y-2 pb-3">
            <h4 className="font-medium text-sm">{label}</h4>
            <div className="grid md:grid-cols-3 gap-3">
              {fields.map((field) => (
                <FormField key={field} type="text" label={t.fields[field as keyof typeof t.fields] as string}
                  value={(data.notifications[key] as Record<string, string>)[field] || ""}
                  onChange={(v) => update({ notifications: { ...data.notifications, [key]: { ...data.notifications[key], [field]: v } } })} />
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Level 4 — Actions</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <FormField type="text" label={t.fields.action} value={data.notifications.level4.action} onChange={(v) => update({ notifications: { ...data.notifications, level4: { ...data.notifications.level4, action: v } } })} placeholder="Auto-initiate transfer / Notify authorities" />
            <FormField type="text" label="Timeframe" value={data.notifications.level4.timeframe} onChange={(v) => update({ notifications: { ...data.notifications, level4: { ...data.notifications.level4, timeframe: v } } })} />
          </div>
        </div>
      </FormSection>

      <FormSection title={t.sections.timeframeConfig}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="number" label="Confirmation Window (Days)" value={data.timeframes.confirmationWindowDays} onChange={(v) => update({ timeframes: { ...data.timeframes, confirmationWindowDays: Number(v) } })} />
          <FormField type="number" label="Wait Before Level 2 (Hours)" value={data.timeframes.waitBeforeLevel2Hours} onChange={(v) => update({ timeframes: { ...data.timeframes, waitBeforeLevel2Hours: Number(v) } })} />
          <FormField type="number" label="Wait Before Level 3 (Days)" value={data.timeframes.waitBeforeLevel3Days} onChange={(v) => update({ timeframes: { ...data.timeframes, waitBeforeLevel3Days: Number(v) } })} />
          <FormField type="number" label="Wait Before Level 4 (Days)" value={data.timeframes.waitBeforeLevel4Days} onChange={(v) => update({ timeframes: { ...data.timeframes, waitBeforeLevel4Days: Number(v) } })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.activationSection}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="date" label="Activated On" value={data.activatedOn} onChange={(v) => update({ activatedOn: v })} />
          <FormField type="text" label="Activated By" value={data.activatedBy} onChange={(v) => update({ activatedBy: v })} />
          <FormField type="date" label="Next Review" value={data.nextReview} onChange={(v) => update({ nextReview: v })} />
        </div>
        <div className="space-y-2 mt-3">
          <FormField type="checkbox" label="Configuration confirmed and activated" checked={data.configConfirmed} onChange={(c) => update({ configConfirmed: c })} />
          <FormField type="checkbox" label="Test run successfully performed" checked={data.testRunCompleted} onChange={(c) => update({ testRunCompleted: c })} />
          <FormField type="checkbox" label="All contacts informed" checked={data.contactsInformed} onChange={(c) => update({ contactsInformed: c })} />
        </div>
      </FormSection>
    </div>
  );
}
