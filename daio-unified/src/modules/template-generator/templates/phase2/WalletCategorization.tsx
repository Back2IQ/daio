import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { WalletCategorizationData, WalletEntry } from "../../types";

const EMPTY_WALLET: WalletEntry = {
  walletId: "", category: "HIGH", keyType: "SEED", platform: "", address: "",
  securityFeatures: { hardwareWallet: false, mfa: false, passwordProtected: false, hsm: false, coldStorage: false, multiSig: false },
  accessType: "SINGLE", documented: false, heirAccessConfigured: false, notes: "",
};

const DEFAULTS: WalletCategorizationData = {
  clientName: "", date: new Date().toISOString().slice(0, 10), consultantName: "",
  wallets: [{ ...EMPTY_WALLET }],
};

export function WalletCategorization() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["wallet-categorization"].data as Partial<WalletCategorizationData>) };

  const update = (partial: Partial<WalletCategorizationData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "wallet-categorization", data: partial });
  };

  const updateWallet = (index: number, entry: Partial<WalletEntry>) => {
    const arr = [...data.wallets];
    arr[index] = { ...arr[index], ...entry };
    update({ wallets: arr });
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-amber-100 text-amber-800";
      case "CUSTODY": return "bg-green-100 text-green-800";
      default: return "";
    }
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

      <FormSection title={t.sections.documentationProtocol}>
        {data.wallets.map((wallet, i) => (
          <div key={i} className="space-y-3 pb-4">
            {i > 0 && <Separator className="my-4" />}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Wallet {i + 1}</span>
                <Badge className={categoryColor(wallet.category)}>{wallet.category}</Badge>
              </div>
              {data.wallets.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => update({ wallets: data.wallets.filter((_, idx) => idx !== i) })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField type="text" label={t.fields.walletId} value={wallet.walletId} onChange={(v) => updateWallet(i, { walletId: v })} required />
              <FormField type="select" label={t.fields.category} value={wallet.category} onChange={(v) => updateWallet(i, { category: v as WalletEntry["category"] })} options={[
                { value: "HIGH", label: "High Security (Cold/HW/Multi-Sig)" },
                { value: "MEDIUM", label: "Medium Security (Warm/Software)" },
                { value: "CUSTODY", label: "Custody / Exchange" },
              ]} />
              <FormField type="select" label={t.fields.keyType} value={wallet.keyType} onChange={(v) => updateWallet(i, { keyType: v as WalletEntry["keyType"] })} options={[
                { value: "SEED", label: "Seed Phrase" }, { value: "PRIVATE_KEY", label: "Private Key" }, { value: "MNEMONIC", label: "Mnemonic" },
              ]} />
              <FormField type="text" label={t.fields.platform} value={wallet.platform} onChange={(v) => updateWallet(i, { platform: v })} />
              <FormField type="text" label={t.fields.walletAddress} value={wallet.address} onChange={(v) => updateWallet(i, { address: v })} />
              <FormField type="select" label={t.fields.accessType} value={wallet.accessType} onChange={(v) => updateWallet(i, { accessType: v as WalletEntry["accessType"] })} options={[
                { value: "SINGLE", label: "Single-User" }, { value: "MULTI", label: "Multi-User" },
                { value: "THRESHOLD", label: "Threshold Scheme" }, { value: "TIME_LOCKED", label: "Time-Locked" },
              ]} />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <FormField type="checkbox" label={t.fields.hardwareWallet} checked={wallet.securityFeatures.hardwareWallet} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, hardwareWallet: c } })} />
              <FormField type="checkbox" label={t.fields.mfa} checked={wallet.securityFeatures.mfa} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, mfa: c } })} />
              <FormField type="checkbox" label={t.fields.passwordProtected} checked={wallet.securityFeatures.passwordProtected} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, passwordProtected: c } })} />
              <FormField type="checkbox" label={t.fields.coldStorage} checked={wallet.securityFeatures.coldStorage} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, coldStorage: c } })} />
              <FormField type="checkbox" label={t.fields.multiSig} checked={wallet.securityFeatures.multiSig} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, multiSig: c } })} />
              <FormField type="checkbox" label={t.fields.hsm} checked={wallet.securityFeatures.hsm} onChange={(c) => updateWallet(i, { securityFeatures: { ...wallet.securityFeatures, hsm: c } })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField type="checkbox" label={t.fields.documented} checked={wallet.documented} onChange={(c) => updateWallet(i, { documented: c })} />
              <FormField type="checkbox" label={t.fields.heirAccessConfigured} checked={wallet.heirAccessConfigured} onChange={(c) => updateWallet(i, { heirAccessConfigured: c })} />
            </div>
            <FormField type="textarea" label={t.fields.notes} value={wallet.notes} onChange={(v) => updateWallet(i, { notes: v })} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ wallets: [...data.wallets, { ...EMPTY_WALLET }] })}>
          <Plus className="w-4 h-4 mr-2" /> {t.app.addEntry}
        </Button>
      </FormSection>
    </div>
  );
}
