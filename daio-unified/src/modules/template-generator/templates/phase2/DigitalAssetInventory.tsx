import { useState } from "react";
import { useI18n } from "../../i18n";
import { useTemplates } from "../../context/TemplateContext";
import { FormSection } from "../../components/FormSection";
import { FormField } from "../../components/FormField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { DigitalAssetInventoryData, CryptoAssetEntry, NftAssetEntry, CloudAccountEntry, TokenizedAssetEntry } from "../../types";

const EMPTY_CRYPTO: CryptoAssetEntry = { assetType: "", walletType: "HARDWARE", walletAddress: "", approximateValueEur: 0, acquisitionDate: "", specialFeatures: "", documented: false };
const EMPTY_NFT: NftAssetEntry = { collectionName: "", tokenId: "", platform: "", approximateValueEur: 0, contractAddress: "", nftType: "" };
const EMPTY_CLOUD: CloudAccountEntry = { serviceType: "EMAIL", platform: "", accountId: "", estimatedValueEur: 0, accessType: "PASSWORD", specialFeatures: "" };
const EMPTY_TOKEN: TokenizedAssetEntry = { assetType: "", tokenStandard: "", platform: "", tokenCount: 0, approximateValueEur: 0, specialFeatures: "" };

const DEFAULTS: DigitalAssetInventoryData = {
  clientName: "", inventoryNumber: "", consultantName: "",
  createdDate: new Date().toISOString().slice(0, 10), lastModifiedDate: "", status: "ACTIVE",
  cryptocurrencies: [{ ...EMPTY_CRYPTO }], nfts: [], cloudAccounts: [], tokenizedAssets: [],
  totalValueEur: 0, walletAddressCount: 0, exchangeAccountCount: 0, nftAssetCount: 0, cloudAccountCount: 0,
  documentationStatus: "NOT_STARTED", nextSteps: "",
};

export function DigitalAssetInventory() {
  const { t } = useI18n();
  const { state, dispatch } = useTemplates();
  const data = { ...DEFAULTS, ...(state.templates["digital-asset-inventory"].data as Partial<DigitalAssetInventoryData>) };
  const [activeTab, setActiveTab] = useState<"crypto" | "nft" | "cloud" | "token">("crypto");

  const update = (partial: Partial<DigitalAssetInventoryData>) => {
    dispatch({ type: "UPDATE_TEMPLATE_DATA", template: "digital-asset-inventory", data: partial });
  };

  const updateCrypto = (index: number, entry: Partial<CryptoAssetEntry>) => {
    const arr = [...data.cryptocurrencies];
    arr[index] = { ...arr[index], ...entry };
    update({ cryptocurrencies: arr });
  };

  const updateNft = (index: number, entry: Partial<NftAssetEntry>) => {
    const arr = [...data.nfts];
    arr[index] = { ...arr[index], ...entry };
    update({ nfts: arr });
  };

  const updateCloud = (index: number, entry: Partial<CloudAccountEntry>) => {
    const arr = [...data.cloudAccounts];
    arr[index] = { ...arr[index], ...entry };
    update({ cloudAccounts: arr });
  };

  const updateToken = (index: number, entry: Partial<TokenizedAssetEntry>) => {
    const arr = [...data.tokenizedAssets];
    arr[index] = { ...arr[index], ...entry };
    update({ tokenizedAssets: arr });
  };

  return (
    <div className="space-y-6">
      <FormSection title={t.sections.generalInfo}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="text" label={t.fields.clientName} value={data.clientName} onChange={(v) => update({ clientName: v })} required />
          <FormField type="text" label={t.fields.inventoryNumber} value={data.inventoryNumber} onChange={(v) => update({ inventoryNumber: v })} required />
          <FormField type="text" label={t.fields.consultant} value={data.consultantName} onChange={(v) => update({ consultantName: v })} />
          <FormField type="date" label="Created" value={data.createdDate} onChange={(v) => update({ createdDate: v })} />
          <FormField type="date" label="Last Modified" value={data.lastModifiedDate} onChange={(v) => update({ lastModifiedDate: v })} />
          <FormField type="select" label={t.fields.status} value={data.status} onChange={(v) => update({ status: v as DigitalAssetInventoryData["status"] })} options={[
            { value: "ACTIVE", label: "Active" }, { value: "ARCHIVED", label: "Archived" },
          ]} />
        </div>
      </FormSection>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(["crypto", "nft", "cloud", "token"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {tab === "crypto" ? t.sections.cryptoAssets : tab === "nft" ? t.sections.nftAssets : tab === "cloud" ? t.sections.cloudAccounts : t.sections.tokenizedAssets}
          </button>
        ))}
      </div>

      {activeTab === "crypto" && (
        <FormSection title={t.sections.cryptoAssets}>
          {data.cryptocurrencies.map((entry, i) => (
            <div key={i} className="space-y-3 pb-4">
              {i > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Entry {i + 1}</span>
                {data.cryptocurrencies.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => { const arr = data.cryptocurrencies.filter((_, idx) => idx !== i); update({ cryptocurrencies: arr }); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField type="text" label={t.fields.assetType} value={entry.assetType} onChange={(v) => updateCrypto(i, { assetType: v })} placeholder="BTC / ETH / USDT / Other" />
                <FormField type="select" label={t.fields.walletType} value={entry.walletType} onChange={(v) => updateCrypto(i, { walletType: v as CryptoAssetEntry["walletType"] })} options={[
                  { value: "HARDWARE", label: "Hardware" }, { value: "SOFTWARE", label: "Software" }, { value: "CUSTODY", label: "Custody" }, { value: "EXCHANGE", label: "Exchange" },
                ]} />
                <FormField type="text" label={t.fields.walletAddress} value={entry.walletAddress} onChange={(v) => updateCrypto(i, { walletAddress: v })} />
                <FormField type="number" label={t.fields.approximateValueEur} value={entry.approximateValueEur} onChange={(v) => updateCrypto(i, { approximateValueEur: Number(v) })} />
                <FormField type="date" label={t.fields.acquisitionDate} value={entry.acquisitionDate} onChange={(v) => updateCrypto(i, { acquisitionDate: v })} />
                <FormField type="checkbox" label={t.fields.documented} checked={entry.documented} onChange={(c) => updateCrypto(i, { documented: c })} />
              </div>
              <FormField type="text" label={t.fields.specialFeatures} value={entry.specialFeatures} onChange={(v) => updateCrypto(i, { specialFeatures: v })} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update({ cryptocurrencies: [...data.cryptocurrencies, { ...EMPTY_CRYPTO }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t.app.addEntry}
          </Button>
        </FormSection>
      )}

      {activeTab === "nft" && (
        <FormSection title={t.sections.nftAssets}>
          {data.nfts.length === 0 && <p className="text-sm text-muted-foreground">No NFT entries yet.</p>}
          {data.nfts.map((entry, i) => (
            <div key={i} className="space-y-3 pb-4">
              {i > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Entry {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => { const arr = data.nfts.filter((_, idx) => idx !== i); update({ nfts: arr }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField type="text" label={t.fields.collectionName} value={entry.collectionName} onChange={(v) => updateNft(i, { collectionName: v })} />
                <FormField type="text" label={t.fields.tokenId} value={entry.tokenId} onChange={(v) => updateNft(i, { tokenId: v })} />
                <FormField type="text" label={t.fields.platform} value={entry.platform} onChange={(v) => updateNft(i, { platform: v })} />
                <FormField type="number" label={t.fields.approximateValueEur} value={entry.approximateValueEur} onChange={(v) => updateNft(i, { approximateValueEur: Number(v) })} />
                <FormField type="text" label={t.fields.contractAddress} value={entry.contractAddress} onChange={(v) => updateNft(i, { contractAddress: v })} />
                <FormField type="text" label={t.fields.nftType} value={entry.nftType} onChange={(v) => updateNft(i, { nftType: v })} placeholder="Art / Gaming / Domain / Handle" />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update({ nfts: [...data.nfts, { ...EMPTY_NFT }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t.app.addEntry}
          </Button>
        </FormSection>
      )}

      {activeTab === "cloud" && (
        <FormSection title={t.sections.cloudAccounts}>
          {data.cloudAccounts.length === 0 && <p className="text-sm text-muted-foreground">No cloud account entries yet.</p>}
          {data.cloudAccounts.map((entry, i) => (
            <div key={i} className="space-y-3 pb-4">
              {i > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Entry {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => { const arr = data.cloudAccounts.filter((_, idx) => idx !== i); update({ cloudAccounts: arr }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField type="select" label={t.fields.serviceType} value={entry.serviceType} onChange={(v) => updateCloud(i, { serviceType: v as CloudAccountEntry["serviceType"] })} options={[
                  { value: "EMAIL", label: "Email" }, { value: "SOCIAL", label: "Social Media" }, { value: "CLOUD", label: "Cloud Storage" }, { value: "STREAMING", label: "Streaming" }, { value: "OTHER", label: "Other" },
                ]} />
                <FormField type="text" label={t.fields.platform} value={entry.platform} onChange={(v) => updateCloud(i, { platform: v })} />
                <FormField type="text" label={t.fields.accountId} value={entry.accountId} onChange={(v) => updateCloud(i, { accountId: v })} />
                <FormField type="number" label="Estimated Value (EUR)" value={entry.estimatedValueEur} onChange={(v) => updateCloud(i, { estimatedValueEur: Number(v) })} />
                <FormField type="select" label={t.fields.accessType} value={entry.accessType} onChange={(v) => updateCloud(i, { accessType: v as CloudAccountEntry["accessType"] })} options={[
                  { value: "PASSWORD", label: "Password" }, { value: "MFA", label: "MFA" }, { value: "OTHER", label: "Other" },
                ]} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update({ cloudAccounts: [...data.cloudAccounts, { ...EMPTY_CLOUD }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t.app.addEntry}
          </Button>
        </FormSection>
      )}

      {activeTab === "token" && (
        <FormSection title={t.sections.tokenizedAssets}>
          {data.tokenizedAssets.length === 0 && <p className="text-sm text-muted-foreground">No tokenized asset entries yet.</p>}
          {data.tokenizedAssets.map((entry, i) => (
            <div key={i} className="space-y-3 pb-4">
              {i > 0 && <Separator className="my-4" />}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Entry {i + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => { const arr = data.tokenizedAssets.filter((_, idx) => idx !== i); update({ tokenizedAssets: arr }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField type="text" label={t.fields.assetType} value={entry.assetType} onChange={(v) => updateToken(i, { assetType: v })} placeholder="Real Estate / Business / Art" />
                <FormField type="text" label={t.fields.tokenStandard} value={entry.tokenStandard} onChange={(v) => updateToken(i, { tokenStandard: v })} placeholder="ERC-20 / ERC-721" />
                <FormField type="text" label={t.fields.platform} value={entry.platform} onChange={(v) => updateToken(i, { platform: v })} />
                <FormField type="number" label={t.fields.tokenCount} value={entry.tokenCount} onChange={(v) => updateToken(i, { tokenCount: Number(v) })} />
                <FormField type="number" label={t.fields.approximateValueEur} value={entry.approximateValueEur} onChange={(v) => updateToken(i, { approximateValueEur: Number(v) })} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update({ tokenizedAssets: [...data.tokenizedAssets, { ...EMPTY_TOKEN }] })}>
            <Plus className="w-4 h-4 mr-2" /> {t.app.addEntry}
          </Button>
        </FormSection>
      )}

      <FormSection title={t.sections.summary}>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField type="number" label={t.fields.totalValueEur} value={data.totalValueEur} onChange={(v) => update({ totalValueEur: Number(v) })} />
          <FormField type="select" label={t.fields.documentationStatus} value={data.documentationStatus} onChange={(v) => update({ documentationStatus: v as DigitalAssetInventoryData["documentationStatus"] })} options={[
            { value: "FULL", label: "Fully Recorded" }, { value: "PARTIAL", label: "Partially Recorded" }, { value: "NOT_STARTED", label: "Not Yet Recorded" },
          ]} />
        </div>
        <FormField type="textarea" label="Next Steps" value={data.nextSteps} onChange={(v) => update({ nextSteps: v })} />
      </FormSection>
    </div>
  );
}
