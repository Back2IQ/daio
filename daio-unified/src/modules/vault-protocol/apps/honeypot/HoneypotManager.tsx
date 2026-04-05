// DAIO Vault Protocol — Honeypot Manager
// Create, manage, and monitor honeypot containers and canary shards

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Bug,
  Eye,
  Clock,
  Siren,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { createDecoyVault } from "../../utils/honeypot";
import { useVaultStore } from "../../store/vault-store";

const STRATEGIES = [
  {
    name: "Decoy Vault",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-amber-500",
    description:
      "Ein komplett gefälschter Container mit plausiblem Fake-Secret. Angreifer glaubt erfolgreich gewesen zu sein und nutzt ein wertloses Secret.",
    mechanism:
      "Identische Metadata-Struktur, gleicher Label, gleiches Format. Der Threshold ist bewusst niedriger gesetzt, damit der Decoy 'leichter' knackbar erscheint.",
    detection:
      "Wenn der Angreifer das Fake-Secret verwendet, wird es als ungültig erkannt (z.B. ungültige Wallet-Adresse).",
  },
  {
    name: "Canary Shard",
    icon: <Bug className="w-5 h-5" />,
    color: "bg-red-500",
    description:
      "Einzelne Fake-Shards, die unter echten Shards gemischt werden. Erkennt, WELCHER Verteilungskanal kompromittiert wurde.",
    mechanism:
      "Canary-Shards nutzen einen anderen Polynom-Grad. Bei Rekonstruktion mit einem Canary-Shard wird mathematisch inkonsistenter Output erzeugt, der als Canary erkennbar ist.",
    detection:
      "Das System erkennt den Canary-Shard automatisch vor der Rekonstruktion und löst einen Alert aus. Der Angreifer erfährt, dass er entdeckt wurde.",
  },
  {
    name: "Tripwire Container",
    icon: <Siren className="w-5 h-5" />,
    color: "bg-purple-500",
    description:
      "Container mit bewusst niedrigerem Threshold als der echte. Wird als Frühwarnsystem eingesetzt — wird vor dem echten Container kompromittiert.",
    mechanism:
      "Beispiel: Echter Vault = 3-von-5, Tripwire = 2-von-3. Wenn der Tripwire geknackt wird, wissen die Validatoren, dass ein Angriff läuft, BEVOR der echte Vault gefährdet ist.",
    detection:
      "Alle echten Validatoren werden über Pre-Shared Alert Keys benachrichtigt. Zeit für Gegenmaßnahmen (z.B. Secret-Rotation, Schlüssel-Widerruf).",
  },
];

export function HoneypotManager() {
  const { vaults, honeypots, attempts, addHoneypot } = useVaultStore();
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDecoy = async (parentVaultId: string) => {
    const parentVault = vaults.find((v) => v.id === parentVaultId);
    if (!parentVault) {
      toast.error("Vault nicht gefunden");
      return;
    }

    setIsCreating(true);
    try {
      const decoy = await createDecoyVault(parentVault);
      addHoneypot(decoy);
      toast.success("Decoy-Vault erstellt");
    } catch {
      toast.error("Fehler beim Erstellen des Decoy-Vaults");
    } finally {
      setIsCreating(false);
    }
  };

  const honeypotAttempts = attempts.filter((a) => a.isHoneypot);

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Strategies & Creation */}
        <div className="space-y-4">
          {/* Strategy Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                Honeypot-Strategien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {STRATEGIES.map((strategy) => {
                const isExpanded = expandedStrategy === strategy.name;
                return (
                  <div
                    key={strategy.name}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedStrategy(isExpanded ? null : strategy.name)
                      }
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 ${strategy.color} rounded-lg flex items-center justify-center text-white`}
                        >
                          {strategy.icon}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {strategy.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {strategy.description}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 border-t bg-slate-50 dark:bg-slate-800/50">
                        <div className="pt-3">
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                            Beschreibung
                          </p>
                          <p className="text-sm">{strategy.description}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                            Mechanismus
                          </p>
                          <p className="text-sm">{strategy.mechanism}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                            Erkennung
                          </p>
                          <p className="text-sm">{strategy.detection}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Create Decoy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                Decoy-Vault erstellen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Erstelle zuerst einen Vault im "Vault Creator", um
                  Honeypots hinzuzufügen.
                </p>
              ) : (
                <div className="space-y-2">
                  {vaults.map((vault) => {
                    const existingDecoys = honeypots.filter(
                      (h) => h.parentVaultId === vault.id
                    );
                    return (
                      <div
                        key={vault.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {vault.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vault.threshold}/{vault.totalShares} •{" "}
                            {existingDecoys.length} Decoy
                            {existingDecoys.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateDecoy(vault.id)}
                          disabled={isCreating}
                        >
                          + Decoy
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Honeypots & Alert Log */}
        <div className="space-y-4">
          {/* Active Honeypots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                Aktive Honeypots ({honeypots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {honeypots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Keine Honeypots aktiv</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {honeypots.map((hp) => {
                    const isExpanded = expandedLog === hp.id;
                    return (
                      <div
                        key={hp.id}
                        className={`border rounded-lg ${
                          hp.triggered
                            ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                hp.triggered
                                  ? "bg-red-500 animate-pulse"
                                  : "bg-green-500"
                              }`}
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {hp.metadata.label}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {hp.id.slice(0, 24)}...
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={hp.triggered ? "destructive" : "outline"}
                            >
                              {hp.triggered ? "AUSGELÖST" : "Bereit"}
                            </Badge>
                            {hp.triggerLog.length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  setExpandedLog(isExpanded ? null : hp.id)
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {isExpanded && hp.triggerLog.length > 0 && (
                          <div className="border-t px-3 pb-3">
                            {hp.triggerLog.map((trigger, i) => (
                              <div
                                key={i}
                                className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs font-mono">
                                    {new Date(
                                      trigger.timestamp
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs mt-1">
                                  Shards: [{trigger.shardsUsed.join(", ")}]
                                </div>
                                <div className="text-xs font-mono mt-1 truncate">
                                  Alert: {trigger.alertToken.slice(0, 32)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Siren className="w-4 h-4" />
                Alert-Log ({honeypotAttempts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {honeypotAttempts.length === 0 ? (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
                  <Shield className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Keine unauthorisierten Zugriffsversuche erkannt.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {honeypotAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-200">
                          Unauthorized Access Attempt
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          Vault: {attempt.vaultId.slice(0, 20)}...
                        </div>
                        <div>
                          Zeit:{" "}
                          {new Date(attempt.timestamp).toLocaleString()}
                        </div>
                        <div>
                          Shards: [{attempt.shardIndices.join(", ")}]
                        </div>
                        {attempt.alertToken && (
                          <div className="font-mono">
                            Token: {attempt.alertToken.slice(0, 32)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
