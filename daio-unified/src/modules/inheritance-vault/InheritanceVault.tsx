import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Archive, Users, Plus, Trash2, KeyRound, ShieldCheck,
  UserCheck, Scale, Eye,
} from "lucide-react";
import { useGovernanceStore } from "@/store/governance";
import type { Beneficiary } from "@/store/governance";

type TabId = "container" | "beneficiaries" | "fragments";

export default function InheritanceVault() {
  const [tab, setTab] = useState<TabId>("container");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg font-bold">Inheritance Vault</h1>
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
              <TabsList>
                <TabsTrigger value="container" className="gap-1.5 text-xs sm:text-sm">
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">Container</span>
                </TabsTrigger>
                <TabsTrigger value="beneficiaries" className="gap-1.5 text-xs sm:text-sm">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Beneficiaries</span>
                </TabsTrigger>
                <TabsTrigger value="fragments" className="gap-1.5 text-xs sm:text-sm">
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden sm:inline">Fragments</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === "container" && <ContainerTab />}
        {tab === "beneficiaries" && <BeneficiariesTab />}
        {tab === "fragments" && <FragmentsTab />}
      </main>
    </div>
  );
}

// ── Container Tab ────────────────────────────────────────────────

function ContainerTab() {
  const { inheritanceContainer, setInheritanceContainer } = useGovernanceStore();
  const ic = inheritanceContainer;

  const levelColor = ic.level === 3 ? "text-emerald-500" : ic.level === 2 ? "text-amber-500" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold">Inheritance Container</h2>
          <p className="text-sm text-muted-foreground">Document your digital estate in three levels of depth.</p>
        </div>
        <Badge variant="outline" className={levelColor}>Level {ic.level}</Badge>
      </div>

      {/* Level 1 — Foundation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#c9a54e]" />
            Level 1 — Foundation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Asset Inventory</Label>
            <Textarea
              placeholder="List all digital assets: wallets, exchanges, accounts, domains..."
              value={ic.assetInventory}
              onChange={(e) => setInheritanceContainer({ assetInventory: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Access Architecture</Label>
            <Textarea
              placeholder="How are assets accessed? Keys, passwords, 2FA, hardware wallets..."
              value={ic.accessArchitecture}
              onChange={(e) => setInheritanceContainer({ accessArchitecture: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Heir Designation</Label>
            <Textarea
              placeholder="Who inherits what? Roles, shares, conditions..."
              value={ic.heirDesignation}
              onChange={(e) => setInheritanceContainer({ heirDesignation: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Level 2 — Extended */}
      <Card className={ic.level < 2 && !ic.legacyContext && !ic.platformInstructions ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#c9a54e]" />
            Level 2 — Extended Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Legacy Context</Label>
            <Textarea
              placeholder="Personal context: intentions, wishes, important background..."
              value={ic.legacyContext}
              onChange={(e) => setInheritanceContainer({ legacyContext: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Platform Instructions</Label>
            <Textarea
              placeholder="Step-by-step instructions per platform: how to access, transfer, close..."
              value={ic.platformInstructions}
              onChange={(e) => setInheritanceContainer({ platformInstructions: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Level 3 — Professional */}
      <Card className={ic.level < 3 && !ic.professionalContacts ? "opacity-60" : ""}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#c9a54e]" />
            Level 3 — Professional Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Professional Contacts</Label>
            <Textarea
              placeholder="Notary, lawyer, tax advisor, wealth manager — names, contacts, mandates..."
              value={ic.professionalContacts}
              onChange={(e) => setInheritanceContainer({ professionalContacts: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {ic.lastUpdated > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Last saved: {new Date(ic.lastUpdated).toLocaleString()} · Version {ic.version}
        </p>
      )}
    </div>
  );
}

// ── Beneficiaries Tab ────────────────────────────────────────────

function BeneficiariesTab() {
  const { beneficiaries, addBeneficiary, removeBeneficiary } = useGovernanceStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Beneficiary["role"]>("heir");

  const heirs = beneficiaries.filter((b) => b.role === "heir");
  const guardians = beneficiaries.filter((b) => b.role === "guardian");
  const notaries = beneficiaries.filter((b) => b.role === "notary");

  function handleAdd() {
    if (!name.trim() || !email.trim()) return;
    addBeneficiary({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, role });
    setName(""); setEmail(""); setPhone(""); setAdding(false);
  }

  const roleIcon = (r: string) => r === "heir" ? <UserCheck className="w-4 h-4" /> : r === "guardian" ? <ShieldCheck className="w-4 h-4" /> : <Scale className="w-4 h-4" />;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Heirs", count: heirs.length, color: "text-emerald-500" },
          { label: "Guardians", count: guardians.length, color: "text-blue-500" },
          { label: "Notaries", count: notaries.length, color: "text-[#c9a54e]" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Beneficiaries</CardTitle>
            <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {adding && (
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus />
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Beneficiary["role"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heir">Heir</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="notary">Notary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !email.trim()}>Add Beneficiary</Button>
              </div>
            </div>
          )}

          {beneficiaries.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground text-center py-6">No beneficiaries yet. Add heirs, guardians, or a notary.</p>
          )}

          {beneficiaries.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border bg-accent/20">
              <div className="text-muted-foreground">{roleIcon(b.role)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{b.name}</span>
                  <Badge variant="outline" className="text-[10px]">{b.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{b.email}{b.phone ? ` · ${b.phone}` : ""}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeBeneficiary(b.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Fragments Tab ────────────────────────────────────────────────

function FragmentsTab() {
  const { keyFragments, generateKeyFragments, beneficiaries } = useGovernanceStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#c9a54e]" />
              Shamir Key Fragments
            </CardTitle>
            <Button size="sm" onClick={generateKeyFragments} disabled={beneficiaries.length === 0}>
              Generate Fragments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {beneficiaries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Add beneficiaries first to generate key fragments.
            </p>
          ) : keyFragments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No fragments generated yet. Click "Generate Fragments" to create Shamir shares.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {keyFragments.map((f) => (
                <div key={f.id} className="p-3 rounded-lg border bg-accent/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{f.holder}</span>
                    <Badge variant="outline" className={`text-[10px] ${
                      f.status === "distributed" ? "text-emerald-500" :
                      f.status === "activated" ? "text-[#c9a54e]" : "text-muted-foreground"
                    }`}>
                      {f.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{f.type}</Badge>
                    {f.encrypted && <span>Encrypted</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {keyFragments.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Threshold: {Math.max(2, Math.ceil((keyFragments.length) / 2) + 1)} of {keyFragments.length} fragments required for reconstruction.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
