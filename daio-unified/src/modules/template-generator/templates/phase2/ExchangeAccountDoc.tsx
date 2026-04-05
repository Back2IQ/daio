import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { ExchangeAccountDocData, ExchangeAccountData } from "../../types";

const EMPTY_ACCOUNT: ExchangeAccountData = {
  platformName: "", platformType: "CEX", website: "", jurisdiction: "",
  regulatoryStatus: "REGULATED", accountId: "", accountType: "INDIVIDUAL",
  primaryEmail: "", registeredSince: "", assets: [], totalValueEur: 0,
  twoFactorMethod: "APP", backupCodesSecured: false, masterPasswordSecured: false,
  apiKeysAvailable: false, apiKeyCount: 0,
  specialFunctions: { staking: false, lending: false, marginTrading: false, apiTrading: false, institutional: false },
  kycStatus: "VERIFIED", verificationLevel: "TIER1",
  insuredByPlatform: "UNKNOWN", inheritanceProcess: "", requiredDocuments: "",
  supportContact: "", estimatedProcessingWeeks: 0, notes: "",
};

const DEFAULTS: ExchangeAccountDocData = {
  clientName: "", date: new Date().toISOString().slice(0, 10), consultantName: "",
  accounts: [{ ...EMPTY_ACCOUNT }],
};

export function ExchangeAccountDoc() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["exchange-account-doc"].data as Partial<ExchangeAccountDocData>) };

  const update = (partial: Partial<ExchangeAccountDocData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "exchange-account-doc", data: partial });
  };

  const updateAccount = (index: number, entry: Partial<ExchangeAccountData>) => {
    const arr = [...data.accounts];
    arr[index] = { ...arr[index], ...entry };
    update({ accounts: arr });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="date" label={t.fields.date} value={data.date} onChange={(v) => update({ date: v })} />
          <FormField type="text" label={t.fields.consultant} value={data.consultantName} onChange={(v) => update({ consultantName: v })} />
        </div>
      </FormSection>

      {data.accounts.map((account, i) => (
        <div key={i} className="space-y-4">
          {i > 0 && <Separator className="my-6" />}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Account {i + 1}: {account.platformName || "New"}</h3>
            {data.accounts.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => update({ accounts: data.accounts.filter((_, idx) => idx !== i) })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <FormSection title={t.sections.platformInfo}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField type="text" label={t.fields.platformName} value={account.platformName} onChange={(v) => updateAccount(i, { platformName: v })} required />
              <FormField type="select" label={t.fields.platformType} value={account.platformType} onChange={(v) => updateAccount(i, { platformType: v as ExchangeAccountData["platformType"] })} options={[
                { value: "CEX", label: "CEX" }, { value: "DEX", label: "DEX" }, { value: "STAKING", label: "Staking" }, { value: "OTHER", label: "Other" },
              ]} />
              <FormField type="text" label={t.fields.website} value={account.website} onChange={(v) => updateAccount(i, { website: v })} />
              <FormField type="text" label={t.fields.jurisdiction} value={account.jurisdiction} onChange={(v) => updateAccount(i, { jurisdiction: v })} />
              <FormField type="select" label={t.fields.regulatoryStatus} value={account.regulatoryStatus} onChange={(v) => updateAccount(i, { regulatoryStatus: v as ExchangeAccountData["regulatoryStatus"] })} options={[
                { value: "REGULATED", label: "Regulated" }, { value: "UNREGULATED", label: "Unregulated" }, { value: "PARTIALLY", label: "Partially" },
              ]} />
            </div>
          </FormSection>

          <FormSection title={t.sections.accountDetails}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField type="text" label={t.fields.accountId} value={account.accountId} onChange={(v) => updateAccount(i, { accountId: v })} />
              <FormField type="select" label={t.fields.accountType} value={account.accountType} onChange={(v) => updateAccount(i, { accountType: v as ExchangeAccountData["accountType"] })} options={[
                { value: "INDIVIDUAL", label: "Individual" }, { value: "JOINT", label: "Joint" }, { value: "BUSINESS", label: "Business" },
              ]} />
              <FormField type="email" label={t.fields.primaryEmail} value={account.primaryEmail} onChange={(v) => updateAccount(i, { primaryEmail: v })} />
              <FormField type="date" label={t.fields.registeredSince} value={account.registeredSince} onChange={(v) => updateAccount(i, { registeredSince: v })} />
              <FormField type="number" label={t.fields.totalValueEur} value={account.totalValueEur} onChange={(v) => updateAccount(i, { totalValueEur: Number(v) })} />
            </div>
          </FormSection>

          <FormSection title={t.sections.accessSecurity}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField type="select" label={t.fields.twoFactorMethod} value={account.twoFactorMethod} onChange={(v) => updateAccount(i, { twoFactorMethod: v as ExchangeAccountData["twoFactorMethod"] })} options={[
                { value: "SMS", label: "SMS" }, { value: "HARDWARE_KEY", label: "Hardware Key" }, { value: "APP", label: "Authenticator App" },
              ]} />
              <FormField type="checkbox" label={t.fields.backupCodesSecured} checked={account.backupCodesSecured} onChange={(c) => updateAccount(i, { backupCodesSecured: c })} />
              <FormField type="checkbox" label={t.fields.masterPasswordSecured} checked={account.masterPasswordSecured} onChange={(c) => updateAccount(i, { masterPasswordSecured: c })} />
              <FormField type="checkbox" label={t.fields.apiKeysAvailable} checked={account.apiKeysAvailable} onChange={(c) => updateAccount(i, { apiKeysAvailable: c })} />
            </div>
          </FormSection>

          <FormSection title={t.sections.specialFunctions}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <FormField type="checkbox" label="Staking" checked={account.specialFunctions.staking} onChange={(c) => updateAccount(i, { specialFunctions: { ...account.specialFunctions, staking: c } })} />
              <FormField type="checkbox" label="Lending/Farming" checked={account.specialFunctions.lending} onChange={(c) => updateAccount(i, { specialFunctions: { ...account.specialFunctions, lending: c } })} />
              <FormField type="checkbox" label="Margin Trading" checked={account.specialFunctions.marginTrading} onChange={(c) => updateAccount(i, { specialFunctions: { ...account.specialFunctions, marginTrading: c } })} />
              <FormField type="checkbox" label="API Trading" checked={account.specialFunctions.apiTrading} onChange={(c) => updateAccount(i, { specialFunctions: { ...account.specialFunctions, apiTrading: c } })} />
              <FormField type="checkbox" label="Institutional" checked={account.specialFunctions.institutional} onChange={(c) => updateAccount(i, { specialFunctions: { ...account.specialFunctions, institutional: c } })} />
            </div>
          </FormSection>

          <FormSection title={t.sections.inheritanceCase}>
            <FormField type="textarea" label={t.fields.inheritanceProcess} value={account.inheritanceProcess} onChange={(v) => updateAccount(i, { inheritanceProcess: v })} placeholder="Process for heir access to this account" />
            <FormField type="text" label={t.fields.requiredDocuments} value={account.requiredDocuments} onChange={(v) => updateAccount(i, { requiredDocuments: v })} />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField type="text" label={t.fields.supportContact} value={account.supportContact} onChange={(v) => updateAccount(i, { supportContact: v })} />
              <FormField type="number" label={t.fields.estimatedProcessingWeeks} value={account.estimatedProcessingWeeks} onChange={(v) => updateAccount(i, { estimatedProcessingWeeks: Number(v) })} />
            </div>
          </FormSection>
        </div>
      ))}

      <Button variant="outline" onClick={() => update({ accounts: [...data.accounts, { ...EMPTY_ACCOUNT }] })}>
        <Plus className="w-4 h-4 mr-2" /> Add Exchange Account
      </Button>
    </div>
  );
}
