import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { CompletionChecklistData } from "../../types";

const DEFAULTS: CompletionChecklistData = {
  caseId: "", clientName: "", completedOn: "",
  transfers: [{ description: "", transferDate: "", confirmed: false }],
  transferConfirmationsReceived: false, blockchainTransactionsVerified: false, receiptFromHeirs: false,
  caseFileCompiled: false, documentsDigitized: false, integrityHash: false, caseFileArchived: false, retentionUntil: "",
  finalStatementCreated: false, openReceivablesCalculated: false, finalInvoiceSent: false, paymentTracked: false,
  heirFeedback: false, lessonsDocumented: false, improvementsRecorded: false, processAdjustments: false,
  containerArchived: false, sentinelDeactivated: false, legacyProofUpdated: false, statisticsUpdated: false,
  thankYouEmail: false, internalComm: false, stakeholdersInformed: false,
  completedBy: "", checkedBy: "", checkedOn: "", specialNotes: "",
};

export function CompletionChecklist() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["completion-checklist"].data as Partial<CompletionChecklistData>) };

  const update = (partial: Partial<CompletionChecklistData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "completion-checklist", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.caseId} value={data.caseId} onChange={(v) => update({ caseId: v })} required />
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="date" label="Completed On" value={data.completedOn} onChange={(v) => update({ completedOn: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.transferCompletion}>
        {data.transfers.map((transfer, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="grid md:grid-cols-3 gap-3 flex-1">
              <FormField type="text" label="Asset Description" value={transfer.description} onChange={(v) => { const arr = [...data.transfers]; arr[i] = { ...arr[i], description: v }; update({ transfers: arr }); }} />
              <FormField type="date" label={t.fields.transferDate} value={transfer.transferDate} onChange={(v) => { const arr = [...data.transfers]; arr[i] = { ...arr[i], transferDate: v }; update({ transfers: arr }); }} />
              <FormField type="checkbox" label="Confirmed" checked={transfer.confirmed} onChange={(c) => { const arr = [...data.transfers]; arr[i] = { ...arr[i], confirmed: c }; update({ transfers: arr }); }} />
            </div>
            {data.transfers.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => update({ transfers: data.transfers.filter((_, idx) => idx !== i) })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ transfers: [...data.transfers, { description: "", transferDate: "", confirmed: false }] })}>
          <Plus className="w-4 h-4 mr-2" /> Add Transfer
        </Button>
        <Separator className="my-3" />
        <FormField type="checkbox" label="All transfer confirmations received" checked={data.transferConfirmationsReceived} onChange={(c) => update({ transferConfirmationsReceived: c })} />
        <FormField type="checkbox" label="Blockchain transactions verified" checked={data.blockchainTransactionsVerified} onChange={(c) => update({ blockchainTransactionsVerified: c })} />
        <FormField type="checkbox" label="Receipt confirmation from heirs obtained" checked={data.receiptFromHeirs} onChange={(c) => update({ receiptFromHeirs: c })} />
      </FormSection>

      <FormSection title={t.sections.documentArchiving}>
        <FormField type="checkbox" label="Complete case file compiled" checked={data.caseFileCompiled} onChange={(c) => update({ caseFileCompiled: c })} />
        <FormField type="checkbox" label="All documents digitized" checked={data.documentsDigitized} onChange={(c) => update({ documentsDigitized: c })} />
        <FormField type="checkbox" label="Integrity hash of case file created" checked={data.integrityHash} onChange={(c) => update({ integrityHash: c })} />
        <FormField type="checkbox" label="Case file archived in system" checked={data.caseFileArchived} onChange={(c) => update({ caseFileArchived: c })} />
        <FormField type="date" label={t.fields.retentionUntil} value={data.retentionUntil} onChange={(v) => update({ retentionUntil: v })} />
      </FormSection>

      <FormSection title={t.sections.billingCalc}>
        <FormField type="checkbox" label="Final service statement created" checked={data.finalStatementCreated} onChange={(c) => update({ finalStatementCreated: c })} />
        <FormField type="checkbox" label="Open receivables calculated" checked={data.openReceivablesCalculated} onChange={(c) => update({ openReceivablesCalculated: c })} />
        <FormField type="checkbox" label="Final invoice sent" checked={data.finalInvoiceSent} onChange={(c) => update({ finalInvoiceSent: c })} />
        <FormField type="checkbox" label="Payment receipt tracked" checked={data.paymentTracked} onChange={(c) => update({ paymentTracked: c })} />
      </FormSection>

      <FormSection title={t.sections.feedbackLessons}>
        <FormField type="checkbox" label="Heir feedback obtained (survey)" checked={data.heirFeedback} onChange={(c) => update({ heirFeedback: c })} />
        <FormField type="checkbox" label="Internal lessons learned documented" checked={data.lessonsDocumented} onChange={(c) => update({ lessonsDocumented: c })} />
        <FormField type="checkbox" label="Improvement suggestions recorded" checked={data.improvementsRecorded} onChange={(c) => update({ improvementsRecorded: c })} />
        <FormField type="checkbox" label="Process adjustments identified" checked={data.processAdjustments} onChange={(c) => update({ processAdjustments: c })} />
      </FormSection>

      <FormSection title={t.sections.systemUpdate}>
        <FormField type="checkbox" label="Inheritance Container set to 'Archived'" checked={data.containerArchived} onChange={(c) => update({ containerArchived: c })} />
        <FormField type="checkbox" label="Succession Sentinel deactivated" checked={data.sentinelDeactivated} onChange={(c) => update({ sentinelDeactivated: c })} />
        <FormField type="checkbox" label="Legacy Proof status updated" checked={data.legacyProofUpdated} onChange={(c) => update({ legacyProofUpdated: c })} />
        <FormField type="checkbox" label="Statistics updated" checked={data.statisticsUpdated} onChange={(c) => update({ statisticsUpdated: c })} />
      </FormSection>

      <FormSection title={t.sections.communication}>
        <FormField type="checkbox" label="Final thank-you email to heirs" checked={data.thankYouEmail} onChange={(c) => update({ thankYouEmail: c })} />
        <FormField type="checkbox" label="Internal communication (if needed)" checked={data.internalComm} onChange={(c) => update({ internalComm: c })} />
        <FormField type="checkbox" label="Stakeholders informed (if relevant)" checked={data.stakeholdersInformed} onChange={(c) => update({ stakeholdersInformed: c })} />
      </FormSection>

      <FormSection title={t.sections.formalRelease}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="text" label="Completed By" value={data.completedBy} onChange={(v) => update({ completedBy: v })} />
          <FormField type="text" label="Checked By" value={data.checkedBy} onChange={(v) => update({ checkedBy: v })} />
          <FormField type="date" label="Checked On" value={data.checkedOn} onChange={(v) => update({ checkedOn: v })} />
        </div>
        <FormField type="textarea" label="Special Notes" value={data.specialNotes} onChange={(v) => update({ specialNotes: v })} />
      </FormSection>
    </div>
  );
}
