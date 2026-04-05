import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { DocumentRetentionPolicyData, RetentionClassEntry } from "../../types";

const RETENTION_LEGAL_BASIS = [
  { law: "MiCA Art. 68", period: "5 Jahre", scope: "Aufzeichnungen zu Kryptowerte-Dienstleistungen", source: "VO (EU) 2023/1114", url: "https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=CELEX:32023R1114" },
  { law: "HGB § 257", period: "6-10 Jahre", scope: "Handelsbriefe (6 J.), Buchungsbelege & Jahresabschlüsse (10 J.)", source: "Handelsgesetzbuch" },
  { law: "AO § 147", period: "6-10 Jahre", scope: "Steuerlich relevante Unterlagen", source: "Abgabenordnung" },
  { law: "DSGVO Art. 5(1)(e)", period: "Zweckbindung", scope: "Personenbezogene Daten nur so lange wie nötig", source: "VO (EU) 2016/679" },
  { law: "BGH III ZR 183/17", period: "Unbefristet", scope: "Digitaler Nachlass geht per §1922 BGB auf Erben über", source: "BGH 12.07.2018", url: "https://www.lto.de/recht/hintergruende/h/bgh-iii-zb-30-20-digitaler-nachlass-erben-bekommen-zugriff-auf-facebook-konto" },
  { law: "BGH VI ZR 15/23", period: "Unbefristet", scope: "Digitale Inhalte (Fotos, Nachrichten) sind vererbbar", source: "BGH 02.2024", url: "https://www.anwalt.de/rechtstipps/digitaler-nachlass-im-erbrecht-bgh-staerkt-die-rechte-der-erben-244153.html" },
];

const DEFAULT_CLASSES: RetentionClassEntry[] = [
  { className: "A", priority: "High", documentTypes: "Inheritance Containers, Legacy Proof Certificates, Audit Trails", retentionPeriod: "10 years p.a.", reason: "HGB § 257 Abs. 4 (10 J.), MiCA Art. 68 (5 J.), AO § 147 (10 J.)", procedureOnExpiry: "ARCHIVING" },
  { className: "B", priority: "Medium", documentTypes: "Customer Correspondence, Contract Documents, Invoices/Receipts", retentionPeriod: "7 years", reason: "HGB § 257 Abs. 4 (6 J.), AO § 147 (6-10 J.), DSGVO Art. 5(1)(e)", procedureOnExpiry: "ARCHIVING" },
  { className: "C", priority: "Low", documentTypes: "Internal Memos, Work Instructions, Provisional Documents", retentionPeriod: "3 years", reason: "BGB § 195 (3 J. Regelverjährung), interne Governance-Richtlinie", procedureOnExpiry: "DELETION" },
  { className: "D", priority: "One-Time", documentTypes: "Temporary Files, Draft Documents, Duplicates", retentionPeriod: "Delete immediately", reason: "DSGVO Art. 5(1)(e) Datenminimierung — kein Aufbewahrungszweck", procedureOnExpiry: "DELETION" },
];

const DEFAULTS: DocumentRetentionPolicyData = {
  validFrom: new Date().toISOString().slice(0, 10), version: "1.0", approvedBy: "",
  classes: DEFAULT_CLASSES,
  exceptions: {
    legalDisputes: "Retention until after conclusion + legal period",
    authorityInvestigations: "Retention until after conclusion + 2 years",
    dataProtectionRequests: "Processing per request, suspend deadlines",
  },
  responsibilities: { retentionManager: "", deletionResponsible: "", complianceControl: "" },
};

function LegalBasisCard({ lang }: { lang: string }) {
  const isDE = lang === "de";
  return (
    <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-emerald-600">&#9878;</span>
          {isDE ? "Gesetzliche Aufbewahrungsfristen — Quellenübersicht" : "Statutory Retention Periods — Source Overview"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-medium">{isDE ? "Rechtsgrundlage" : "Legal Basis"}</th>
                <th className="text-left py-2 pr-3 font-medium">{isDE ? "Frist" : "Period"}</th>
                <th className="text-left py-2 pr-3 font-medium">{isDE ? "Geltungsbereich" : "Scope"}</th>
                <th className="text-left py-2 font-medium">{isDE ? "Quelle" : "Source"}</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION_LEGAL_BASIS.map((r) => (
                <tr key={r.law} className="border-b border-dashed last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">
                    {r.law.startsWith("BGH") || r.law.startsWith("MiCA")
                      ? <Badge className={r.law.startsWith("MiCA") ? "bg-purple-100 text-purple-800" : "bg-red-100 text-red-800"}>{r.law}</Badge>
                      : <Badge className="bg-amber-100 text-amber-800">{r.law}</Badge>
                    }
                  </td>
                  <td className="py-2 pr-3 font-medium">{r.period}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.scope}</td>
                  <td className="py-2 text-muted-foreground">
                    {r.url
                      ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">{r.source}</a>
                      : r.source
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-2 mt-3">
          {isDE
            ? "Die Aufbewahrungsklassen in diesem Template basieren auf den oben genannten Rechtsgrundlagen. Bei Kryptowerte-bezogenen Dokumenten gilt zusätzlich MiCA Art. 68 mit einer Mindestaufbewahrungsfrist von 5 Jahren. Die BGH-Rechtsprechung zum digitalen Nachlass (§1922 BGB) erfordert eine lückenlose Governance-Dokumentation."
            : "The retention classes in this template are based on the legal frameworks listed above. For crypto-asset related documents, MiCA Art. 68 additionally requires a minimum retention period of 5 years. BGH case law on digital estate succession (§1922 BGB) requires complete governance documentation."}
        </p>
      </CardContent>
    </Card>
  );
}

export function DocumentRetentionPolicy() {
  const { t, language } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["document-retention-policy"].data as Partial<DocumentRetentionPolicyData>) };

  const update = (partial: Partial<DocumentRetentionPolicyData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "document-retention-policy", data: partial });
  };

  const priorityColor = (p: string) => {
    switch (p) { case "High": return "bg-red-100 text-red-800"; case "Medium": return "bg-amber-100 text-amber-800"; case "Low": return "bg-green-100 text-green-800"; default: return "bg-slate-100 text-slate-800"; }
  };

  return (
    <div className="space-y-6">
      <LegalBasisCard lang={language} />

      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="date" label={t.fields.validFrom} value={data.validFrom} onChange={(v) => update({ validFrom: v })} />
          <FormField type="text" label={t.fields.version} value={data.version} onChange={(v) => update({ version: v })} />
          <FormField type="text" label={t.fields.approvedBy} value={data.approvedBy} onChange={(v) => update({ approvedBy: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.retentionClasses}>
        {data.classes.map((cls, i) => (
          <div key={i} className="p-4 rounded-lg bg-muted space-y-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Class {cls.className}</span>
                <Badge className={priorityColor(cls.priority)}>{cls.priority} Priority</Badge>
              </div>
              {data.classes.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => update({ classes: data.classes.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField type="text" label={t.fields.documentTypes} value={cls.documentTypes} onChange={(v) => { const arr = [...data.classes]; arr[i] = { ...arr[i], documentTypes: v }; update({ classes: arr }); }} />
              <FormField type="text" label={t.fields.retentionPeriod} value={cls.retentionPeriod} onChange={(v) => { const arr = [...data.classes]; arr[i] = { ...arr[i], retentionPeriod: v }; update({ classes: arr }); }} />
              <FormField type="text" label={t.fields.reason} value={cls.reason} onChange={(v) => { const arr = [...data.classes]; arr[i] = { ...arr[i], reason: v }; update({ classes: arr }); }} />
              <FormField type="select" label={t.fields.procedureOnExpiry} value={cls.procedureOnExpiry} onChange={(v) => { const arr = [...data.classes]; arr[i] = { ...arr[i], procedureOnExpiry: v }; update({ classes: arr }); }} options={[
                { value: "ARCHIVING", label: "Archiving" }, { value: "DELETION", label: "Deletion" }, { value: "OTHER", label: "Other" },
              ]} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ classes: [...data.classes, { className: "", priority: "", documentTypes: "", retentionPeriod: "", reason: "", procedureOnExpiry: "DELETION" }] })}>
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </FormSection>

      <FormSection title={t.sections.exceptionsSpecial}>
        <FormField type="textarea" label="Ongoing Legal Disputes" value={data.exceptions.legalDisputes} onChange={(v) => update({ exceptions: { ...data.exceptions, legalDisputes: v } })} />
        <FormField type="textarea" label="Ongoing Authority Investigations" value={data.exceptions.authorityInvestigations} onChange={(v) => update({ exceptions: { ...data.exceptions, authorityInvestigations: v } })} />
        <FormField type="textarea" label="Data Protection Requests" value={data.exceptions.dataProtectionRequests} onChange={(v) => update({ exceptions: { ...data.exceptions, dataProtectionRequests: v } })} />
      </FormSection>

      <FormSection title={t.sections.responsibilities}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label="Retention Manager" value={data.responsibilities.retentionManager} onChange={(v) => update({ responsibilities: { ...data.responsibilities, retentionManager: v } })} />
          <FormField type="text" label="Deletion Responsible" value={data.responsibilities.deletionResponsible} onChange={(v) => update({ responsibilities: { ...data.responsibilities, deletionResponsible: v } })} />
          <FormField type="text" label="Compliance Control" value={data.responsibilities.complianceControl} onChange={(v) => update({ responsibilities: { ...data.responsibilities, complianceControl: v } })} />
        </div>
      </FormSection>
    </div>
  );
}
