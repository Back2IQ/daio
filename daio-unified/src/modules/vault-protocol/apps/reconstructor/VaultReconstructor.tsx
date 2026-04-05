// DAIO Vault Protocol — Vault Reconstructor
// Reconstruct a secret from T shards using Lagrange interpolation

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Unlock,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Lock,
  Trash2,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import type { Shard, EncryptedShard, FeldmanCommitments } from "../../types";
import { reconstructSecret, verifyShare } from "../../utils/shamir";
import { decryptShard, importShardFromJSON } from "../../utils/vault-crypto";
import { detectCanaryShard } from "../../utils/honeypot";
import {
  renderSecretOnCanvas,
  renderCountdown,
  destroyCanvas,
  blockClipboard,
  addPrintBlockStyles,
} from "../../utils/secure-display";
import { useVaultStore } from "../../store/vault-store";

interface ShardEntry {
  id: string;
  shard: Shard | null;
  encrypted: EncryptedShard | null;
  verified: boolean | null; // null = not yet verified
  source: "paste" | "file" | "manual";
}

export function VaultReconstructor() {
  const [vaultId, setVaultId] = useState("");
  const [threshold, setThreshold] = useState(3);
  const [shardEntries, setShardEntries] = useState<ShardEntry[]>([]);
  const [feldman, setFeldman] = useState<FeldmanCommitments | null>(null);

  // Decryption dialog
  const [decryptDialog, setDecryptDialog] = useState<{
    open: boolean;
    entryId: string;
    encrypted: EncryptedShard | null;
  }>({ open: false, entryId: "", encrypted: null });
  const [decryptPassword, setDecryptPassword] = useState("");

  // Reconstruction state
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [reconstructedSecret, setReconstructedSecret] = useState<string | null>(
    null
  );
  const [honeypotDetected, setHoneypotDetected] = useState(false);

  // Canvas display
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { vaults, recordAttempt } = useVaultStore();

  // Find vault metadata
  const vaultMetadata = vaults.find((v) => v.id === vaultId);

  // Auto-populate threshold from vault metadata
  useEffect(() => {
    if (vaultMetadata) {
      setThreshold(vaultMetadata.threshold);
      setFeldman(vaultMetadata.feldman);
    }
  }, [vaultMetadata]);

  // Count valid shards
  const validShards = shardEntries.filter((e) => e.shard !== null);
  const progress = (validShards.length / threshold) * 100;
  const quorumReached = validShards.length >= threshold;

  const addShardEntry = () => {
    setShardEntries((prev) => [
      ...prev,
      {
        id: `entry-${Date.now()}`,
        shard: null,
        encrypted: null,
        verified: null,
        source: "manual",
      },
    ]);
  };

  const removeShardEntry = (id: string) => {
    setShardEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleFileImport = useCallback(
    (entryId: string, file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          if (parsed.ciphertext) {
            // Encrypted shard — need password
            const encrypted = importShardFromJSON(content);
            setShardEntries((prev) =>
              prev.map((entry) =>
                entry.id === entryId
                  ? { ...entry, encrypted, source: "file" }
                  : entry
              )
            );
            setDecryptDialog({ open: true, entryId, encrypted });
          } else if (parsed.index && parsed.value) {
            // Plain shard
            const shard: Shard = {
              index: parsed.index,
              value: parsed.value,
              vaultId: parsed.vaultId || vaultId,
              isCanary: parsed.isCanary,
            };

            // Verify against Feldman commitments if available
            let verified: boolean | null = null;
            if (feldman) {
              verified = verifyShare(shard, feldman);
            }

            setShardEntries((prev) =>
              prev.map((entry) =>
                entry.id === entryId
                  ? { ...entry, shard, verified, source: "file" }
                  : entry
              )
            );

            toast.success(`Shard #${shard.index} imported`);
          }
        } catch {
          toast.error("Invalid shard format");
        }
      };
      reader.readAsText(file);
    },
    [vaultId, feldman]
  );

  const handleDecrypt = useCallback(async () => {
    if (!decryptDialog.encrypted || !decryptPassword) return;

    try {
      const shard = await decryptShard(
        decryptDialog.encrypted,
        decryptPassword
      );

      let verified: boolean | null = null;
      if (feldman) {
        verified = verifyShare(shard, feldman);
      }

      setShardEntries((prev) =>
        prev.map((entry) =>
          entry.id === decryptDialog.entryId
            ? { ...entry, shard, verified }
            : entry
        )
      );

      setDecryptDialog({ open: false, entryId: "", encrypted: null });
      setDecryptPassword("");
      toast.success(`Shard #${shard.index} decrypted`);
    } catch {
      toast.error("Wrong password or corrupt shard");
    }
  }, [decryptDialog, decryptPassword, feldman]);

  const handleReconstruct = useCallback(async () => {
    if (!quorumReached) return;

    setIsReconstructing(true);

    try {
      const shards = validShards.map((e) => e.shard!);

      // Check for canary shards
      if (detectCanaryShard(shards)) {
        setHoneypotDetected(true);

        recordAttempt({
          id: `attempt-${Date.now()}`,
          vaultId: vaultId || "unknown",
          timestamp: new Date().toISOString(),
          shardIndices: shards.map((s) => s.index),
          success: false,
          isHoneypot: true,
          alertToken: `canary-${Date.now()}`,
        });

        toast.error("HONEYPOT DETECTED! Unauthorized access attempt logged.");
        setIsReconstructing(false);
        return;
      }

      // Reconstruct
      const secret = reconstructSecret(shards);
      setReconstructedSecret(secret);

      // Record successful attempt
      recordAttempt({
        id: `attempt-${Date.now()}`,
        vaultId: vaultId || "unknown",
        timestamp: new Date().toISOString(),
        shardIndices: shards.map((s) => s.index),
        success: true,
        isHoneypot: false,
      });

      // Start secure display
      const displaySeconds = vaultMetadata?.timerSeconds || 30;
      setSecondsLeft(displaySeconds);
      setTimerActive(true);

      // Enable security measures
      const unblockClipboard = blockClipboard();
      const unblockPrint = addPrintBlockStyles();

      // Render on canvas
      setTimeout(() => {
        if (canvasRef.current) {
          renderSecretOnCanvas(canvasRef.current, secret, {
            mode: vaultMetadata?.displayMode || "canvas-timer",
            timerSeconds: displaySeconds,
            watermarkText: "DAIO VAULT",
            sessionId: Math.random().toString(36).slice(2, 8),
          });
        }
      }, 100);

      // Start countdown
      let remaining = displaySeconds;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);

        if (canvasRef.current) {
          renderCountdown(canvasRef.current, remaining, displaySeconds);
        }

        if (remaining <= 0) {
          // Auto-destruct
          if (timerRef.current) clearInterval(timerRef.current);
          if (canvasRef.current) destroyCanvas(canvasRef.current);
          setTimerActive(false);
          setReconstructedSecret(null);
          unblockClipboard();
          unblockPrint();
          toast.info("Secret auto-destroyed after timer expiration");
        }
      }, 1000);

      toast.success("Secret reconstructed! Secure display active.");
    } catch (err) {
      toast.error(
        `Reconstruction failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsReconstructing(false);
    }
  }, [quorumReached, validShards, vaultId, vaultMetadata, recordAttempt]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleManualDestroy = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (canvasRef.current) destroyCanvas(canvasRef.current);
    setTimerActive(false);
    setReconstructedSecret(null);
    setSecondsLeft(0);
    toast.info("Secret manually destroyed");
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Vault Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Unlock className="w-4 h-4" />
              Identify vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Vault ID</Label>
              <Input
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                placeholder="vault-... or choose from saved vaults"
                className="mt-1 font-mono text-sm"
                disabled={timerActive}
              />
            </div>

            {vaults.length > 0 && !vaultId && (
              <div>
                <Label className="text-xs mb-2 block">
                  Saved vaults:
                </Label>
                <div className="space-y-1">
                  {vaults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVaultId(v.id)}
                      className="w-full flex items-center justify-between p-2 rounded border hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm"
                    >
                      <span>{v.label}</span>
                      <Badge variant="outline">
                        {v.threshold}/{v.totalShares}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {vaultMetadata && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                <Shield className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Vault "{vaultMetadata.label}" found. Threshold:{" "}
                  {vaultMetadata.threshold} of {vaultMetadata.totalShares}.
                  Feldman verification available.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="text-xs">Threshold (T)</Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 2)}
                min={2}
                max={10}
                className="mt-1 w-32"
                disabled={!!vaultMetadata || timerActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Honeypot Alert */}
        {honeypotDetected && (
          <Alert className="bg-red-50 border-red-500 dark:bg-red-900/30">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>HONEYPOT DETECTED!</strong> A canary shard was used.
              This access attempt has been logged and all validators are
              being alerted.
            </AlertDescription>
          </Alert>
        )}

        {/* Shard Input */}
        {!timerActive && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  Enter shards
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addShardEntry}>
                  + Add shard
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Quorum: {validShards.length}/{threshold}
                  </span>
                  <span>
                    {quorumReached ? (
                      <Badge className="bg-green-500">Quorum reached</Badge>
                    ) : (
                      <Badge variant="outline">
                        {threshold - validShards.length} shard
                        {threshold - validShards.length !== 1 ? "s" : ""} still needed
                      </Badge>
                    )}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Shard entries */}
              {shardEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border ${
                    entry.shard
                      ? entry.verified === false
                        ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                        : "border-green-300 bg-green-50 dark:bg-green-900/10"
                      : "border-slate-200 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {entry.shard ? (
                        entry.verified === false ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span className="text-sm font-medium">
                        {entry.shard
                          ? `Shard #${entry.shard.index}`
                          : "Import shard"}
                      </span>
                      {entry.verified !== null && (
                        <Badge
                          variant={entry.verified ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {entry.verified
                            ? "Feldman ✓"
                            : "Feldman ✗"}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeShardEntry(entry.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {!entry.shard && (
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileImport(entry.id, file);
                          }}
                        />
                        <div className="flex items-center justify-center gap-2 p-3 rounded border-2 border-dashed cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-muted-foreground">
                          <Upload className="w-4 h-4" />
                          Choose JSON file
                        </div>
                      </label>
                    </div>
                  )}

                  {entry.shard && (
                    <code className="text-xs text-muted-foreground font-mono">
                      {entry.shard.value.slice(0, 32)}...
                    </code>
                  )}
                </div>
              ))}

              {shardEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    Click "+ Add shard" to import shards
                  </p>
                </div>
              )}

              {/* Reconstruct Button */}
              {quorumReached && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleReconstruct}
                  disabled={isReconstructing}
                >
                  {isReconstructing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Reconstructing...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 mr-2" />
                      Reconstruct secret ({validShards.length}/{threshold}{" "}
                      shards)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Secure Display */}
        {(reconstructedSecret || timerActive) && (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm text-green-600">
                  <Shield className="w-4 h-4" />
                  Secure display — secret
                </CardTitle>
                <div className="flex items-center gap-2">
                  {timerActive && (
                    <Badge
                      variant={secondsLeft > 10 ? "secondary" : "destructive"}
                      className="font-mono"
                    >
                      <Timer className="w-3 h-3 mr-1" />
                      {secondsLeft}s
                    </Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleManualDestroy}
                  >
                    Destroy now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full"
                  style={{ height: "250px" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Canvas rendering active. No DOM text. Copy blocked.
                Auto-destruct on timer.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Commitments Import */}
        {!feldman && !vaultMetadata && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                Feldman Commitments (optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Import the Feldman commitments to verify each shard before
                reconstruction.
              </p>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const parsed = JSON.parse(
                          ev.target?.result as string
                        ) as FeldmanCommitments;
                        if (parsed.commitments && parsed.generator) {
                          setFeldman(parsed);
                          toast.success("Feldman commitments imported");
                        }
                      } catch {
                        toast.error("Invalid commitment format");
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
                <div className="flex items-center justify-center gap-2 p-4 rounded border-2 border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  Import commitments JSON
                </div>
              </label>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Decrypt Dialog */}
      <Dialog
        open={decryptDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDecryptDialog({ open: false, entryId: "", encrypted: null });
            setDecryptPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decrypt shard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This shard is encrypted with AES-256-GCM. Enter the password
              that was set at creation time.
            </p>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                placeholder="Shard password..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDecryptDialog({ open: false, entryId: "", encrypted: null });
                setDecryptPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDecrypt}
              disabled={!decryptPassword}
            >
              <Lock className="w-4 h-4 mr-2" />
              Decrypt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
