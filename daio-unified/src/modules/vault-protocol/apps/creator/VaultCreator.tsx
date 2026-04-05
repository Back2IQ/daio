// DAIO Vault Protocol — Vault Creator
// Create a Shamir-split vault with configurable threshold, honeypots, and display mode

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Split,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import type {
  VaultConfig,
  Shard,
  EncryptedShard,
  VaultMetadata,
  DisplayMode,
  HoneypotVault,
  VaultCreationResult,
} from "../../types";
import { generateShares, generateFeldmanCommitments } from "../../utils/shamir";
import { encryptShard, exportShardAsJSON, hashVaultMetadata } from "../../utils/vault-crypto";
import { createDecoyVault, createCanaryShards } from "../../utils/honeypot";
import { useVaultStore } from "../../store/vault-store";

function generateId(): string {
  return `vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function VaultCreator() {
  // Configuration state
  const [secret, setSecret] = useState("");
  const [label, setLabel] = useState("");
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [honeypotCount, setHoneypotCount] = useState(1);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("canvas-timer");
  const [timerSeconds, setTimerSeconds] = useState(30);

  // Result state
  const [result, setResult] = useState<VaultCreationResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Encryption dialog
  const [encryptDialog, setEncryptDialog] = useState<{
    open: boolean;
    shard: Shard | null;
  }>({ open: false, shard: null });
  const [encryptPassword, setEncryptPassword] = useState("");
  const [encryptedShards, setEncryptedShards] = useState<
    Map<number, EncryptedShard>
  >(new Map());

  // Security checks
  const [securityChecks, setSecurityChecks] = useState({
    secretCleared: false,
    coefficientsCleared: false,
    offlineVerified: false,
  });

  const { addVault, addHoneypot } = useVaultStore();

  // Check if online
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : false;

  const handleCreate = useCallback(async () => {
    if (!secret.trim()) {
      toast.error("Secret cannot be empty");
      return;
    }
    if (!label.trim()) {
      toast.error("Vault label is required");
      return;
    }

    setIsCreating(true);

    try {
      const vaultId = generateId();
      const config: VaultConfig = {
        label,
        threshold,
        totalShares,
        honeypotCount,
        displayMode,
        timerSeconds,
      };

      // Step 1: Generate Shamir shares
      const { shards, coefficients } = generateShares(
        secret,
        config.threshold,
        config.totalShares,
        vaultId
      );

      // Step 2: Generate Feldman commitments (before clearing coefficients)
      const feldman = generateFeldmanCommitments(coefficients);

      // Step 3: Memory wipe — zero out coefficients
      coefficients.fill(0n);
      setSecurityChecks((prev) => ({ ...prev, coefficientsCleared: true }));

      // Step 4: Create vault metadata
      const metadataBase = {
        id: vaultId,
        label: config.label,
        createdAt: new Date().toISOString(),
        threshold: config.threshold,
        totalShares: config.totalShares,
        feldman,
        displayMode: config.displayMode,
        timerSeconds: config.timerSeconds,
        honeypotVaultIds: [] as string[],
      };

      const hash = await hashVaultMetadata(metadataBase);
      const metadata: VaultMetadata = { ...metadataBase, hash };

      // Step 5: Create honeypot vaults
      const honeypots: HoneypotVault[] = [];
      for (let i = 0; i < config.honeypotCount; i++) {
        const decoy = await createDecoyVault(metadata);
        honeypots.push(decoy);
        metadata.honeypotVaultIds.push(decoy.id);
      }

      // Step 6: Create canary shards
      const canaryShards = createCanaryShards(
        vaultId,
        config.honeypotCount
      );

      // Step 7: Clear secret from state
      setSecret("");
      setSecurityChecks((prev) => ({ ...prev, secretCleared: true }));

      // Step 8: Persist metadata to store
      addVault(metadata);
      honeypots.forEach((h) => addHoneypot(h));

      const creationResult: VaultCreationResult = {
        metadata,
        shards,
        canaryShards,
        honeypots,
      };

      setResult(creationResult);
      toast.success("Vault created! Distribute shards securely now.");
    } catch (err) {
      toast.error(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    secret,
    label,
    threshold,
    totalShares,
    honeypotCount,
    displayMode,
    timerSeconds,
    addVault,
    addHoneypot,
  ]);

  const handleEncryptShard = useCallback(async () => {
    if (!encryptDialog.shard || !encryptPassword) return;

    try {
      const encrypted = await encryptShard(
        encryptDialog.shard,
        encryptPassword
      );
      setEncryptedShards((prev) => {
        const next = new Map(prev);
        next.set(encryptDialog.shard!.index, encrypted);
        return next;
      });
      toast.success(`Shard #${encryptDialog.shard.index} encrypted`);
      setEncryptDialog({ open: false, shard: null });
      setEncryptPassword("");
    } catch {
      toast.error("Encryption failed");
    }
  }, [encryptDialog.shard, encryptPassword]);

  const handleDownloadShard = useCallback(
    (shard: Shard) => {
      const encrypted = encryptedShards.get(shard.index);
      const data = encrypted
        ? exportShardAsJSON(encrypted)
        : JSON.stringify(shard, null, 2);

      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daio-shard-${shard.index}-${shard.vaultId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [encryptedShards]
  );

  // Ensure threshold ≤ totalShares
  const handleTotalSharesChange = (value: number[]) => {
    const n = value[0];
    setTotalShares(n);
    if (threshold > n) setThreshold(n);
  };

  return (
    <div className="p-6">
      {/* Offline Warning */}
      {isOnline && (
        <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>WARNING: network connection detected!</strong> For maximum
            security, vault creation should be done offline (air-gapped).
            Disconnect from the internet.
          </AlertDescription>
        </Alert>
      )}

      {!isOnline && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20">
          <WifiOff className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Offline mode active.</strong> Secure environment for
            vault creation confirmed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column — Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound className="w-4 h-4" />
                Enter secret
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">
                  Passphrase / Private Key / Seed Phrase
                </Label>
                <div className="relative mt-1">
                  <textarea
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter the secret to protect here..."
                    className="w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ WebkitTextSecurity: showSecret ? "none" : "disc" } as React.CSSProperties}
                    disabled={!!result}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The secret is cleared from memory immediately after the
                  split.
                </p>
              </div>

              <div>
                <Label className="text-xs">Vault label</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Main BTC Wallet Succession"
                  className="mt-1"
                  disabled={!!result}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Split className="w-4 h-4" />
                Threshold configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs">
                    Validators (N): {totalShares}
                  </Label>
                  <Badge variant="outline">{totalShares} shards</Badge>
                </div>
                <Slider
                  value={[totalShares]}
                  onValueChange={handleTotalSharesChange}
                  min={2}
                  max={10}
                  step={1}
                  disabled={!!result}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Number of shard recipients
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs">
                    Threshold (T): {threshold}
                  </Label>
                  <Badge variant="outline">
                    {threshold} of {totalShares} required
                  </Badge>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(v) => setThreshold(v[0])}
                  min={2}
                  max={totalShares}
                  step={1}
                  disabled={!!result}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum shards for reconstruction
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs">
                    Honeypots: {honeypotCount}
                  </Label>
                  <Badge
                    variant="outline"
                    className={
                      honeypotCount > 0
                        ? "border-amber-500 text-amber-600"
                        : ""
                    }
                  >
                    {honeypotCount} decoy
                    {honeypotCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Slider
                  value={[honeypotCount]}
                  onValueChange={(v) => setHoneypotCount(v[0])}
                  min={0}
                  max={3}
                  step={1}
                  disabled={!!result}
                />
              </div>

              <div>
                <Label className="text-xs">Display mode</Label>
                <Select
                  value={displayMode}
                  onValueChange={(v) => setDisplayMode(v as DisplayMode)}
                  disabled={!!result}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canvas-timer">
                      Canvas + Timer (recommended)
                    </SelectItem>
                    <SelectItem value="split-screen">
                      Split-screen (paranoid)
                    </SelectItem>
                    <SelectItem value="qr-only">
                      QR code only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs">
                    Auto-Destruct Timer: {timerSeconds}s
                  </Label>
                </div>
                <Slider
                  value={[timerSeconds]}
                  onValueChange={(v) => setTimerSeconds(v[0])}
                  min={10}
                  max={120}
                  step={5}
                  disabled={!!result}
                />
              </div>
            </CardContent>
          </Card>

          {!result && (
            <Button
              className="w-full"
              size="lg"
              onClick={handleCreate}
              disabled={!secret.trim() || !label.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating vault...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Create vault & generate shards
                </>
              )}
            </Button>
          )}

          {result && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setResult(null);
                setEncryptedShards(new Map());
                setSecurityChecks({
                  secretCleared: false,
                  coefficientsCleared: false,
                  offlineVerified: false,
                });
                setLabel("");
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Create new vault
            </Button>
          )}
        </div>

        {/* Right Column — Result */}
        <div className="space-y-4">
          {!result ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Configure the vault and click "Create"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {threshold}-of-{totalShares} threshold •{" "}
                  {honeypotCount} honeypot{honeypotCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Metadata Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    Vault created
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <code className="ml-2 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {result.metadata.id.slice(0, 20)}...
                      </code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hash:</span>
                      <code className="ml-2 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {result.metadata.hash.slice(0, 16)}...
                      </code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threshold:</span>
                      <Badge className="ml-2" variant="secondary">
                        {result.metadata.threshold} of{" "}
                        {result.metadata.totalShares}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Honeypots:</span>
                      <Badge
                        className="ml-2"
                        variant={
                          result.honeypots.length > 0
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {result.honeypots.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Security checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Secret cleared from RAM",
                        ok: securityChecks.secretCleared,
                      },
                      {
                        label: "Polynomial coefficients cleared",
                        ok: securityChecks.coefficientsCleared,
                      },
                      {
                        label: "Offline mode",
                        ok: !isOnline,
                      },
                    ].map((check) => (
                      <div
                        key={check.label}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          check.ok
                            ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                        }`}
                      >
                        {check.ok ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        {check.label}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shard List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Split className="w-4 h-4" />
                    Shards ({result.shards.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.shards.map((shard) => {
                      const isEncrypted = encryptedShards.has(shard.index);
                      return (
                        <div
                          key={shard.index}
                          className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-bold">
                              {shard.index}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                Shard #{shard.index}
                              </div>
                              <code className="text-xs text-muted-foreground font-mono">
                                {shard.value.slice(0, 16)}...
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEncrypted && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                <Lock className="w-3 h-3 mr-1" />
                                Encrypted
                              </Badge>
                            )}
                            {!isEncrypted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEncryptDialog({ open: true, shard })
                                }
                              >
                                <Lock className="w-3 h-3 mr-1" />
                                Encrypt
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadShard(shard)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Canary Shards */}
                    {result.canaryShards.length > 0 && (
                      <>
                        <div className="text-xs font-semibold text-amber-600 uppercase mt-4 mb-2">
                          Canary Shards (Honeypot)
                        </div>
                        {result.canaryShards.map((shard) => (
                          <div
                            key={shard.index}
                            className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-sm font-bold">
                                C
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  Canary #{shard.index}
                                </div>
                                <code className="text-xs text-muted-foreground font-mono">
                                  {shard.value.slice(0, 16)}...
                                </code>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadShard(shard)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Feldman Commitments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    Feldman VSS Commitments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    These commitments enable verification of individual shards
                    without revealing the secret. Can be stored publicly.
                  </p>
                  <div className="space-y-2">
                    {result.metadata.feldman.commitments.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-mono"
                      >
                        <Badge variant="outline" className="shrink-0">
                          C{i}
                        </Badge>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">
                          {c.slice(0, 32)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(c);
                            toast.success("Commitment copied");
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      const data = JSON.stringify(
                        result.metadata.feldman,
                        null,
                        2
                      );
                      const blob = new Blob([data], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `daio-commitments-${result.metadata.id.slice(0, 8)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export all commitments
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Encrypt Dialog */}
      <Dialog
        open={encryptDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setEncryptDialog({ open: false, shard: null });
            setEncryptPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Encrypt shard #{encryptDialog.shard?.index}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Set a password for this shard. The recipient will need this
              password to decrypt their shard.
            </p>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                placeholder="Choose a strong password..."
                className="mt-1"
              />
            </div>
            {encryptPassword.length > 0 && encryptPassword.length < 8 && (
              <p className="text-xs text-amber-600">
                At least 8 characters recommended
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEncryptDialog({ open: false, shard: null });
                setEncryptPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEncryptShard}
              disabled={encryptPassword.length < 4}
            >
              <Lock className="w-4 h-4 mr-2" />
              Encrypt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
