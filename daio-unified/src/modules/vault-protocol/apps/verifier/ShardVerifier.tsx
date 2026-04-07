// DAIO Vault Protocol — Shard Verifier
// Verify individual shards against Feldman VSS commitments

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldX,
  Upload,
  Hash,
  Lock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import type { FeldmanCommitments, Shard } from "../../types";
import { verifyShare } from "../../utils/shamir";
import { useVaultStore } from "../../store/vault-store";

interface VerificationResult {
  shard: Shard;
  valid: boolean;
  timestamp: string;
}

export function ShardVerifier() {
  const [feldman, setFeldman] = useState<FeldmanCommitments | null>(null);
  const [selectedVaultId, setSelectedVaultId] = useState("");
  const [results, setResults] = useState<VerificationResult[]>([]);

  const { vaults } = useVaultStore();

  // Load Feldman from vault metadata
  const handleSelectVault = (vaultId: string) => {
    setSelectedVaultId(vaultId);
    const vault = vaults.find((v) => v.id === vaultId);
    if (vault) {
      setFeldman(vault.feldman);
      toast.success("Feldman commitments loaded");
    }
  };

  const handleImportCommitments = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(
          e.target?.result as string
        ) as FeldmanCommitments;
        if (parsed.commitments && parsed.generator && parsed.prime) {
          setFeldman(parsed);
          toast.success("Feldman commitments imported");
        } else {
          toast.error("Invalid format");
        }
      } catch {
        toast.error("JSON parse error");
      }
    };
    reader.readAsText(file);
  };

  const handleVerifyShard = (file: File) => {
    if (!feldman) {
      toast.error("Load commitments first");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        let shard: Shard;

        if (parsed.ciphertext) {
          toast.error(
            "Encrypted shard — please decrypt in Reconstructor first"
          );
          return;
        }

        shard = {
          index: parsed.index,
          value: parsed.value,
          vaultId: parsed.vaultId || selectedVaultId,
        };

        const valid = verifyShare(shard, feldman);

        setResults((prev) => [
          {
            shard,
            valid,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);

        if (valid) {
          toast.success(`Shard #${shard.index} is VALID`);
        } else {
          toast.error(`Shard #${shard.index} is INVALID`);
        }
      } catch {
        toast.error("Invalid shard format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Commitments Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4" />
              Load Feldman commitments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From saved vaults */}
            {vaults.length > 0 && (
              <div>
                <Label className="text-xs mb-2 block">
                  From saved vault:
                </Label>
                <div className="space-y-1">
                  {vaults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVault(v.id)}
                      className={`w-full flex items-center justify-between p-2 rounded border text-left text-sm ${
                        selectedVaultId === v.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
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

            {/* From file */}
            <div>
              <Label className="text-xs mb-2 block">
                Or import commitments file:
              </Label>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportCommitments(file);
                  }}
                />
                <div className="flex items-center justify-center gap-2 p-3 rounded border-2 border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  Choose JSON file
                </div>
              </label>
            </div>

            {feldman && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {feldman.commitments.length} commitments loaded. Ready for
                  shard verification.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Verify Shard */}
        {feldman && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4" />
                Verify shard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVerifyShard(file);
                  }}
                />
                <div className="flex items-center justify-center gap-2 p-6 rounded border-2 border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span>Upload shard JSON to verify</span>
                </div>
              </label>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  Verification results ({results.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResults([])}
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.valid
                        ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                        : "border-red-300 bg-red-50 dark:bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.valid ? (
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <ShieldX className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          Shard #{result.shard.index}
                        </div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {result.shard.value.slice(0, 24)}...
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.valid ? "secondary" : "destructive"}
                      >
                        {result.valid ? "VALID" : "INVALID"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4" />
              How Feldman VSS works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-sm">1. Commitments</h4>
                <p className="text-xs text-muted-foreground">
                  At vault creation, commitments C_j = g^(a_j) mod p are
                  published. They reveal nothing about the coefficients but
                  mathematically bind the creator.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-sm">2. Verification</h4>
                <p className="text-xs text-muted-foreground">
                  Each validator can check: g^(shard_i) =? product of
                  C_j^(i^j). If the equation holds, the shard is
                  mathematically correct.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-sm">3. Zero Knowledge</h4>
                <p className="text-xs text-muted-foreground">
                  No other validator learns anything about the shard. Only
                  that the shard is correct — not what it contains.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
