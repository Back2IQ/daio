import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Badge } from "@/components/ui/badge";
import type { TransferGateMatrixData } from "../../types";

const DEFAULTS: TransferGateMatrixData = {
  validFrom: new Date().toISOString().slice(0, 10), version: "1.0", approvedBy: "", approvedOn: "",
  classALimit: 1000, classBLowerLimit: 1001, classBUpperLimit: 10000,
  classCLowerLimit: 10001, classCUpperLimit: 100000, classDLowerLimit: 100001,
  classADailyLimit: 5000, classBDailyLimit: 25000, classCDailyLimit: 100000,
  level1Config: { description: "Automatic system validation (identity, entitlement, limit check)" },
  level2Config: { approver: "", timeLimit: 24, documentation: true },
  level3Config: { approver1: "", approver2: "", timeLimit: 48 },
  level4Config: { participants: "", timeLimit: 72 },
  criticalTransferLevel: 3, criticalCriteria: "", notaryRequired: true,
};

export function TransferGateMatrix() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["transfer-gate-matrix"].data as Partial<TransferGateMatrixData>) };

  const update = (partial: Partial<TransferGateMatrixData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "transfer-gate-matrix", data: partial });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField type="date" label={t.fields.validFrom} value={data.validFrom} onChange={(v) => update({ validFrom: v })} />
          <FormField type="text" label={t.fields.version} value={data.version} onChange={(v) => update({ version: v })} />
          <FormField type="text" label={t.fields.approvedBy} value={data.approvedBy} onChange={(v) => update({ approvedBy: v })} />
          <FormField type="date" label="Approved On" value={data.approvedOn} onChange={(v) => update({ approvedOn: v })} />
        </div>
      </FormSection>

      <FormSection title={t.sections.approvalLevels}>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><Badge className="bg-green-500">Level 1</Badge> <span className="font-medium text-sm">Automatic Validation</span></div>
            <p className="text-sm text-muted-foreground">{data.level1Config.description}</p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2"><Badge className="bg-blue-500">Level 2</Badge> <span className="font-medium text-sm">Single Approval</span></div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField type="text" label="Approver" value={data.level2Config.approver} onChange={(v) => update({ level2Config: { ...data.level2Config, approver: v } })} placeholder="Consultant / Team Leader" />
              <FormField type="number" label="Time Limit (Hours)" value={data.level2Config.timeLimit} onChange={(v) => update({ level2Config: { ...data.level2Config, timeLimit: Number(v) } })} />
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2"><Badge className="bg-amber-500">Level 3</Badge> <span className="font-medium text-sm">Dual Approval (Four-Eyes Principle)</span></div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField type="text" label="Approver 1" value={data.level3Config.approver1} onChange={(v) => update({ level3Config: { ...data.level3Config, approver1: v } })} />
              <FormField type="text" label="Approver 2" value={data.level3Config.approver2} onChange={(v) => update({ level3Config: { ...data.level3Config, approver2: v } })} />
              <FormField type="number" label="Time Limit (Hours)" value={data.level3Config.timeLimit} onChange={(v) => update({ level3Config: { ...data.level3Config, timeLimit: Number(v) } })} />
            </div>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2"><Badge className="bg-red-500">Level 4</Badge> <span className="font-medium text-sm">Approval Committee</span></div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField type="text" label="Participants" value={data.level4Config.participants} onChange={(v) => update({ level4Config: { ...data.level4Config, participants: v } })} />
              <FormField type="number" label="Time Limit (Hours)" value={data.level4Config.timeLimit} onChange={(v) => update({ level4Config: { ...data.level4Config, timeLimit: Number(v) } })} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title={t.sections.transferClassification}>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
            <div><span className="text-xs text-muted-foreground">Class A — Low Value</span><p className="font-medium text-sm">Up to {data.classALimit} EUR → Level 1</p></div>
            <FormField type="number" label="Class A Limit (EUR)" value={data.classALimit} onChange={(v) => update({ classALimit: Number(v) })} />
            <FormField type="number" label="Daily Limit (EUR)" value={data.classADailyLimit} onChange={(v) => update({ classADailyLimit: Number(v) })} />
          </div>
          <div className="grid md:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
            <div><span className="text-xs text-muted-foreground">Class B — Medium Value</span><p className="font-medium text-sm">{data.classBLowerLimit}–{data.classBUpperLimit} EUR → Level 2</p></div>
            <FormField type="number" label="Upper Limit (EUR)" value={data.classBUpperLimit} onChange={(v) => update({ classBUpperLimit: Number(v) })} />
            <FormField type="number" label="Daily Limit (EUR)" value={data.classBDailyLimit} onChange={(v) => update({ classBDailyLimit: Number(v) })} />
          </div>
          <div className="grid md:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
            <div><span className="text-xs text-muted-foreground">Class C — High Value</span><p className="font-medium text-sm">{data.classCLowerLimit}–{data.classCUpperLimit} EUR → Level 3</p></div>
            <FormField type="number" label="Upper Limit (EUR)" value={data.classCUpperLimit} onChange={(v) => update({ classCUpperLimit: Number(v) })} />
            <FormField type="number" label="Daily Limit (EUR)" value={data.classCDailyLimit} onChange={(v) => update({ classCDailyLimit: Number(v) })} />
          </div>
          <div className="grid md:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
            <div><span className="text-xs text-muted-foreground">Class D — Very High Value</span><p className="font-medium text-sm">Over {data.classDLowerLimit} EUR → Level 4</p></div>
            <FormField type="number" label="Lower Limit (EUR)" value={data.classDLowerLimit} onChange={(v) => update({ classDLowerLimit: Number(v) })} />
            <div className="text-xs text-muted-foreground self-center">No automatic daily limit</div>
          </div>
        </div>
      </FormSection>

      <FormSection title={t.sections.specialCases}>
        <FormField type="textarea" label="Critical Transfer Criteria" value={data.criticalCriteria} onChange={(v) => update({ criticalCriteria: v })} placeholder="Fast/unusual/foreign transfers" />
        <FormField type="checkbox" label="Notary confirmation required for critical transfers" checked={data.notaryRequired} onChange={(c) => update({ notaryRequired: c })} />
      </FormSection>
    </div>
  );
}
