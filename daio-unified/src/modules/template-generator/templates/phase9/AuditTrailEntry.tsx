import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditTrailEntryData } from "../../types";

const DEFAULTS: AuditTrailEntryData = {
  entryId: "", timestamp: new Date().toISOString(),
  actionType: "TRANSFER", userId: "", userRole: "CONSULTANT", userName: "",
  actionSubType: "", affectedObject: "", description: "",
  stateBefore: "", stateAfter: "", changedFields: "",
  ipAddress: "", userAgent: "", sessionId: "", geolocation: "",
  entryHash: "", digitalSignature: "", verified: false,
  reason: "", approvalRequired: false, approvalId: "",
};

const REGULATORY_SOURCES = {
  bgh: [
    { id: "BGH III ZR 183/17", date: "12.07.2018", title: "Digitaler Nachlass — Universalsukzession gem. §1922 BGB", url: "https://www.lto.de/recht/hintergruende/h/bgh-iii-zb-30-20-digitaler-nachlass-erben-bekommen-zugriff-auf-facebook-konto" },
    { id: "BGH VI ZR 15/23", date: "02.2024", title: "Instagram-Konto als Teil des digitalen Nachlasses", url: "https://www.anwalt.de/rechtstipps/digitaler-nachlass-im-erbrecht-bgh-staerkt-die-rechte-der-erben-244153.html" },
    { id: "OLG Oldenburg 13 U 116/23", date: "30.12.2024", title: "Aktive Weiternutzung von Social-Media-Accounts durch Erben", url: "https://www.noerr.com/de/insights/uneingeschraenkte-und-aktive-weiternutzung-von-social-media-accounts-durch-erben" },
  ],
  mica: [
    { id: "Regulation (EU) 2023/1114", title: "Markets in Crypto-Assets Regulation (MiCA)", articles: "Art. 59-68: Governance & Organisation, Art. 68: Record-keeping obligation (min. 5 years)", url: "https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32023R1114" },
  ],
  national: [
    { id: "§1922 BGB", title: "Universal succession — comprehensive legal transfer" },
    { id: "HGB §§ 238-257", title: "Commercial record-keeping obligations (6-10 years)" },
    { id: "AO § 147", title: "Tax record-keeping obligations (6-10 years)" },
    { id: "GDPR Art. 5, 17", title: "Data minimization & right to erasure" },
  ],
};

function RegulatoryFrameworkCard({ lang }: { lang: string }) {
  const isDE = lang === "de";
  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-blue-600">&#9878;</span>
          {isDE ? "Rechtsgrundlagen & Regulatorischer Rahmen" : "Regulatory Framework & Legal Basis"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">BGH</Badge>
            <span className="font-medium">{isDE ? "Bundesgerichtshof — Leitentscheidungen" : "Federal Court of Justice — Key Rulings"}</span>
          </div>
          <ul className="space-y-1 ml-4">
            {REGULATORY_SOURCES.bgh.map((s) => (
              <li key={s.id} className="text-muted-foreground">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{s.id}</a>
                {" "}({s.date}) — {s.title}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">MiCA</Badge>
            <span className="font-medium">{isDE ? "EU-Kryptowerteregulierung" : "EU Crypto-Asset Regulation"}</span>
          </div>
          <ul className="space-y-1 ml-4">
            {REGULATORY_SOURCES.mica.map((s) => (
              <li key={s.id} className="text-muted-foreground">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{s.id}</a>
                {" — "}{s.title}
                <br /><span className="text-xs">{s.articles}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">DE</Badge>
            <span className="font-medium">{isDE ? "Nationales Recht" : "National Law (Germany)"}</span>
          </div>
          <ul className="space-y-1 ml-4">
            {REGULATORY_SOURCES.national.map((s) => (
              <li key={s.id} className="text-muted-foreground">
                <span className="font-mono text-xs">{s.id}</span> — {s.title}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
          {isDE
            ? "Dieser Audit Trail dokumentiert Aktionen im DAIO-Governance-Framework und erfüllt die Aufbewahrungspflichten gemäß MiCA Art. 68 (min. 5 Jahre), HGB §§ 238-257 (6-10 Jahre) sowie die Nachvollziehbarkeitsanforderungen der BGH-Rechtsprechung zum digitalen Nachlass."
            : "This audit trail documents actions within the DAIO governance framework and fulfills record-keeping obligations under MiCA Art. 68 (min. 5 years), HGB §§ 238-257 (6-10 years), and the traceability requirements established by BGH case law on digital estate succession."}
        </p>
      </CardContent>
    </Card>
  );
}

export function AuditTrailEntry() {
  const { t, language } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["audit-trail-entry"].data as Partial<AuditTrailEntryData>) };

  const update = (partial: Partial<AuditTrailEntryData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "audit-trail-entry", data: partial });
  };

  return (
    <div className="space-y-6">
      <RegulatoryFrameworkCard lang={language} />

      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.entryId} value={data.entryId} onChange={(v) => update({ entryId: v })} required placeholder="YYYY-NUMBER" />
          <FormField type="text" label={t.fields.timestamp} value={data.timestamp} onChange={(v) => update({ timestamp: v })} required />
          <FormField type="select" label={t.fields.actionType} value={data.actionType} onChange={(v) => update({ actionType: v as AuditTrailEntryData["actionType"] })} options={[
            { value: "TRANSFER", label: "Transfer" }, { value: "CONFIG_CHANGE", label: "Configuration Change" },
            { value: "ACCESS", label: "Access" }, { value: "EXCEPTION", label: "Exception" },
          ]} />
        </div>
      </FormSection>

      <FormSection title="Responsible Actor">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.userId} value={data.userId} onChange={(v) => update({ userId: v })} required />
          <FormField type="select" label={t.fields.userRole} value={data.userRole} onChange={(v) => update({ userRole: v as AuditTrailEntryData["userRole"] })} options={[
            { value: "CONSULTANT", label: "Consultant" }, { value: "ADMIN", label: "Admin" },
            { value: "CHECKER", label: "Checker" }, { value: "OTHER", label: "Other" },
          ]} />
          <FormField type="text" label={t.fields.userName} value={data.userName} onChange={(v) => update({ userName: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.actionDetails}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Action Sub-Type" value={data.actionSubType} onChange={(v) => update({ actionSubType: v })} placeholder="TRANSFER_CREATE / CONFIG_UPDATE / ACCESS_LOG" />
          <FormField type="text" label={t.fields.affectedObject} value={data.affectedObject} onChange={(v) => update({ affectedObject: v })} placeholder="CONTAINER-ID / TRANSFER-ID" />
        </div>
        <FormField type="textarea" label={t.fields.description} value={data.description} onChange={(v) => update({ description: v })} />
      </FormSection>

      <FormSection title={t.sections.beforeAfterState}>
        <FormField type="textarea" label={t.fields.stateBefore} value={data.stateBefore} onChange={(v) => update({ stateBefore: v })} />
        <FormField type="textarea" label={t.fields.stateAfter} value={data.stateAfter} onChange={(v) => update({ stateAfter: v })} />
        <FormField type="text" label={t.fields.changedFields} value={data.changedFields} onChange={(v) => update({ changedFields: v })} placeholder="Comma-separated list of changed fields" />
      </FormSection>

      <FormSection title={t.sections.technicalMetadata}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.ipAddress} value={data.ipAddress} onChange={(v) => update({ ipAddress: v })} />
          <FormField type="text" label={t.fields.userAgent} value={data.userAgent} onChange={(v) => update({ userAgent: v })} />
          <FormField type="text" label={t.fields.sessionId} value={data.sessionId} onChange={(v) => update({ sessionId: v })} />
          <FormField type="text" label={t.fields.geolocation} value={data.geolocation} onChange={(v) => update({ geolocation: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.signatureIntegrity}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label={t.fields.entryHash} value={data.entryHash} onChange={(v) => update({ entryHash: v })} />
          <FormField type="text" label={t.fields.digitalSignature} value={data.digitalSignature} onChange={(v) => update({ digitalSignature: v })} />
          <FormField type="checkbox" label={t.fields.verified} checked={data.verified} onChange={(c) => update({ verified: c })} />
        </div>
      </FormSection>

      <FormSection title="Additional Information">
        <FormField type="textarea" label={t.fields.reason} value={data.reason} onChange={(v) => update({ reason: v })} />
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="checkbox" label={t.fields.approvalRequired} checked={data.approvalRequired} onChange={(c) => update({ approvalRequired: c })} />
          <FormField type="text" label={t.fields.approvalId} value={data.approvalId} onChange={(v) => update({ approvalId: v })} />
        </div>
      </FormSection>
    </div>
  );
}
