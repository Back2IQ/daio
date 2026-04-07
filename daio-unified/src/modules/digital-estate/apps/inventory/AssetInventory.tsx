import { useState, useMemo } from "react";
import {
  Plus, Trash2, ChevronDown,
  ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AssetCategoryId, DigitalAsset, GovernanceStatus, AccessMethod } from "../../types";
import { ASSET_CATEGORIES } from "../../utils/categories";
import { ICON_MAP } from "../../utils/icons";

const GOVERNANCE_META: Record<GovernanceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  "undocumented": { label: "Undocumented", icon: <ShieldX className="w-4 h-4" />, color: "text-red-500" },
  "partially-documented": { label: "Partial", icon: <ShieldQuestion className="w-4 h-4" />, color: "text-amber-500" },
  "fully-documented": { label: "Documented", icon: <ShieldAlert className="w-4 h-4" />, color: "text-emerald-400" },
  "succession-ready": { label: "Succession-Ready", icon: <ShieldCheck className="w-4 h-4" />, color: "text-emerald-500" },
};

const ACCESS_OPTIONS: { value: AccessMethod; label: string }[] = [
  { value: "private-key", label: "Private Key" },
  { value: "seed-phrase", label: "Seed Phrase" },
  { value: "password", label: "Password" },
  { value: "2fa", label: "2FA" },
  { value: "hardware-wallet", label: "Hardware Wallet" },
  { value: "biometric", label: "Biometric" },
  { value: "oauth", label: "OAuth / SSO" },
  { value: "api-key", label: "API Key" },
  { value: "unknown", label: "Unknown" },
];

interface Props {
  assets: DigitalAsset[];
  currency: "EUR" | "USD";
  onAssetsChange: (assets: DigitalAsset[]) => void;
  onCurrencyChange: (c: "EUR" | "USD") => void;
}

export default function AssetInventory({ assets, currency, onAssetsChange, onCurrencyChange }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<AssetCategoryId | null>(null);
  const [addingTo, setAddingTo] = useState<AssetCategoryId | null>(null);

  const assetsByCategory = useMemo(() => {
    const map: Partial<Record<AssetCategoryId, DigitalAsset[]>> = {};
    for (const a of assets) {
      (map[a.category] ??= []).push(a);
    }
    return map;
  }, [assets]);

  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + (a.estimatedValue ?? 0), 0),
    [assets]
  );

  const symbol = currency === "EUR" ? "\u20AC" : "$";

  function addAsset(asset: DigitalAsset) {
    onAssetsChange([...assets, asset]);
    setAddingTo(null);
  }

  function removeAsset(id: string) {
    onAssetsChange(assets.filter((a) => a.id !== id));
  }

  function updateAsset(id: string, patch: Partial<DigitalAsset>) {
    onAssetsChange(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 bg-secondary rounded-xl p-4 border">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Total Assets</span>
          <span className="font-bold text-lg">{assets.length}</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <span className="text-sm text-muted-foreground">Estimated Value</span>{" "}
          <span className="font-bold text-lg">
            {symbol}
            {totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="ml-auto">
          <Select value={currency} onValueChange={(v) => onCurrencyChange(v as "EUR" | "USD")}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category cards */}
      {ASSET_CATEGORIES.map((cat) => {
        const catAssets = assetsByCategory[cat.id] ?? [];
        const isExpanded = expandedCategory === cat.id;
        const catValue = catAssets.reduce((s, a) => s + (a.estimatedValue ?? 0), 0);

        return (
          <Card key={cat.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none hover:bg-accent/50 transition-colors"
              onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {ICON_MAP[cat.icon]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {catAssets.length > 0 && (
                    <Badge variant="secondary">
                      {catAssets.length} asset{catAssets.length !== 1 ? "s" : ""}
                      {catValue > 0 && ` \u00B7 ${symbol}${catValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                    </Badge>
                  )}
                  {cat.globalEstimate && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {cat.globalEstimate}
                    </span>
                  )}
                  {!cat.hasReliableLossData && (
                    <Badge variant="outline" className="text-xs hidden md:inline-flex">No loss data</Badge>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-4 space-y-3">
                {catAssets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    symbol={symbol}
                    onUpdate={(patch) => updateAsset(asset.id, patch)}
                    onRemove={() => removeAsset(asset.id)}
                  />
                ))}

                {addingTo === cat.id ? (
                  <AddAssetForm
                    category={cat.id}
                    currency={currency}
                    onAdd={addAsset}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setAddingTo(cat.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add {cat.name} Asset
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Asset Row ────────────────────────────────────────────────────

function AssetRow({
  asset,
  symbol,
  onUpdate,
  onRemove,
}: {
  asset: DigitalAsset;
  symbol: string;
  onUpdate: (patch: Partial<DigitalAsset>) => void;
  onRemove: () => void;
}) {
  const gov = GOVERNANCE_META[asset.governanceStatus];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{asset.name}</span>
          {asset.platform && (
            <span className="text-xs text-muted-foreground">({asset.platform})</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {asset.estimatedValue != null && asset.estimatedValue > 0 && (
            <span className="text-sm font-medium">
              {symbol}{asset.estimatedValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          )}
          {asset.followers != null && (
            <span className="text-xs text-muted-foreground">
              {asset.followers.toLocaleString()} followers
            </span>
          )}
          {asset.monthlyRevenue != null && asset.monthlyRevenue > 0 && (
            <span className="text-xs text-muted-foreground">
              {symbol}{asset.monthlyRevenue.toLocaleString()}/mo
            </span>
          )}
          <div className="flex items-center gap-1">
            {asset.accessMethods.map((m) => (
              <Badge key={m} variant="outline" className="text-[10px] px-1.5 py-0">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Select
        value={asset.governanceStatus}
        onValueChange={(v) => onUpdate({ governanceStatus: v as GovernanceStatus })}
      >
        <SelectTrigger className="w-40 shrink-0">
          <div className={`flex items-center gap-1.5 ${gov.color}`}>
            {gov.icon}
            <span className="text-xs">{gov.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(GOVERNANCE_META) as [GovernanceStatus, typeof gov][]).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              <div className={`flex items-center gap-1.5 ${v.color}`}>
                {v.icon} <span>{v.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ── Add Asset Form ───────────────────────────────────────────────

function AddAssetForm({
  category,
  currency,
  onAdd,
  onCancel,
}: {
  category: AssetCategoryId;
  currency: "EUR" | "USD";
  onAdd: (asset: DigitalAsset) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [value, setValue] = useState("");
  const [access, setAccess] = useState<AccessMethod>("password");
  const [followers, setFollowers] = useState("");
  const [monthlyRev, setMonthlyRev] = useState("");

  const isSocial = category === "social-media";

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      category,
      name: name.trim(),
      platform: platform.trim() || undefined,
      estimatedValue: value ? parseFloat(value) : undefined,
      currency,
      accessMethods: [access],
      governanceStatus: "undocumented",
      followers: followers ? parseInt(followers) : undefined,
      monthlyRevenue: monthlyRev ? parseFloat(monthlyRev) : undefined,
      createdAt: Date.now(),
    });
  }

  return (
    <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input
            placeholder={isSocial ? "Channel name" : "Asset name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <Label className="text-xs">Platform</Label>
          <Input
            placeholder={isSocial ? "YouTube, TikTok..." : "Optional"}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Estimated Value ({currency})</Label>
          <Input
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Access Method</Label>
          <Select value={access} onValueChange={(v) => setAccess(v as AccessMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCESS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isSocial && (
          <>
            <div>
              <Label className="text-xs">Followers / Subscribers</Label>
              <Input
                type="number"
                placeholder="0"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Monthly Revenue ({currency})</Label>
              <Input
                type="number"
                placeholder="0"
                value={monthlyRev}
                onChange={(e) => setMonthlyRev(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>Add Asset</Button>
      </div>
    </div>
  );
}
