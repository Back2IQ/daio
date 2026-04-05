// App 4: Legacy Proof Lab
// Demonstrates proof-of-process with hash chains and tamper detection

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Unlock,
  Hash,
  Link2,
  History,
  Shield,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sha256 } from "../../utils/crypto";

interface ProofEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  data: string;
  hash: string;
  previousHash: string;
}

interface DummyCase {
  id: string;
  name: string;
  assetHint: string;
  assetValue: number;
  executor: string;
  beneficiary: string;
  checklists: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  verifiedBy?: string;
  timestamp?: string;
}

const INITIAL_CASE: DummyCase = {
  id: "case-1",
  name: "Estate of J. Smith",
  assetHint: "Main BTC wallet (Ledger)",
  assetValue: 250000,
  executor: "Sarah Johnson",
  beneficiary: "Michael Smith",
  checklists: [
    { id: "c1", text: "Death certificate obtained", completed: true, verifiedBy: "Dr. Williams", timestamp: "2024-01-15 10:30" },
    { id: "c2", text: "Identity verification completed", completed: true, verifiedBy: "Notary Public", timestamp: "2024-01-16 14:20" },
    { id: "c3", text: "Executor authority confirmed", completed: false },
    { id: "c4", text: "Asset inventory reviewed", completed: false },
    { id: "c5", text: "Beneficiary identity verified", completed: false },
  ],
};

export function LegacyProofLab() {
  const [caseData, setCaseData] = useState<DummyCase>(INITIAL_CASE);
  const [entries, setEntries] = useState<ProofEntry[]>([]);
  const [tamperedEntry, setTamperedEntry] = useState<string | null>(null);
  const [showHashes, setShowHashes] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [tamperMode, setTamperMode] = useState(false);

  // Generate initial hash chain
  useEffect(() => {
    generateHashChain();
  }, []);

  const generateHashChain = async () => {
    const newEntries: ProofEntry[] = [];
    let previousHash = "0".repeat(64);

    // Genesis entry
    const genesisEntry: ProofEntry = {
      id: "entry-0",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      action: "Case Created",
      actor: "System",
      data: `Case: ${caseData.name}`,
      hash: "",
      previousHash,
    };
    genesisEntry.hash = await sha256(`${previousHash}${JSON.stringify(genesisEntry)}`);
    newEntries.push(genesisEntry);
    previousHash = genesisEntry.hash;

    // Add checklist completions
    for (const checklist of caseData.checklists.filter((c) => c.completed)) {
      const entry: ProofEntry = {
        id: `entry-${checklist.id}`,
        timestamp: new Date(checklist.timestamp || Date.now()).toISOString(),
        action: "Checklist Completed",
        actor: checklist.verifiedBy || "Unknown",
        data: checklist.text,
        hash: "",
        previousHash,
      };
      entry.hash = await sha256(`${previousHash}${JSON.stringify(entry)}`);
      newEntries.push(entry);
      previousHash = entry.hash;
    }

    setEntries(newEntries);
  };

  const toggleChecklist = async (checklistId: string) => {
    const updatedChecklists = caseData.checklists.map((c) =>
      c.id === checklistId
        ? {
            ...c,
            completed: !c.completed,
            verifiedBy: !c.completed ? "Current User" : undefined,
            timestamp: !c.completed ? new Date().toISOString() : undefined,
          }
        : c
    );

    setCaseData({ ...caseData, checklists: updatedChecklists });

    // Regenerate hash chain
    setTimeout(() => generateHashChain(), 0);
  };

  const tamperWithEntry = async (entryId: string) => {
    setTamperedEntry(entryId);
    setTamperMode(true);
  };

  const verifyChain = useCallback(() => {
    if (!tamperedEntry) return true;

    // Find tampered entry index
    const tamperedIndex = entries.findIndex((e) => e.id === tamperedEntry);
    if (tamperedIndex === -1) return true;

    // Check if any entry after the tampered one has a mismatch
    for (let i = tamperedIndex + 1; i < entries.length; i++) {
      if (entries[i].previousHash !== entries[i - 1].hash) {
        return false;
      }
    }
    return true;
  }, [entries, tamperedEntry]);

  const isChainValid = verifyChain();

  const formatHash = (hash: string) => {
    if (!showHashes) return "•".repeat(16);
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="w-4 h-4" />
                Dummy Case
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Case Name</Label>
                <Input
                  value={caseData.name}
                  onChange={(e) => setCaseData({ ...caseData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Asset Hint (No Secrets!)</Label>
                <Input
                  value={caseData.assetHint}
                  onChange={(e) => setCaseData({ ...caseData, assetHint: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., Main wallet label"
                />
              </div>
              <div>
                <Label className="text-xs">Estimated Value</Label>
                <Input
                  type="number"
                  value={caseData.assetValue}
                  onChange={(e) =>
                    setCaseData({ ...caseData, assetValue: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Executor</Label>
                  <Input
                    value={caseData.executor}
                    onChange={(e) => setCaseData({ ...caseData, executor: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Beneficiary</Label>
                  <Input
                    value={caseData.beneficiary}
                    onChange={(e) => setCaseData({ ...caseData, beneficiary: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {caseData.checklists.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.completed
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                        : "bg-slate-50 border-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleChecklist(item.id)}
                    />
                    <div className="flex-1">
                      <div className={`text-sm ${item.completed ? "line-through opacity-70" : ""}`}>
                        {item.text}
                      </div>
                      {item.completed && item.verifiedBy && (
                        <div className="text-xs text-slate-500 mt-1">
                          Verified by {item.verifiedBy} on {item.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hash Chain */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Evidence Trail (Hash Chain)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHashes(!showHashes)}
                  >
                    {showHashes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={tamperMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setTamperMode(!tamperMode)}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    {tamperMode ? "Tamper Mode ON" : "Test Tamper"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chain Status */}
              <Alert className={isChainValid ? "bg-green-50" : "bg-red-50"}>
                {isChainValid ? (
                  <>
                    <Shield className="w-5 h-5 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Hash chain integrity verified. All entries are authentic and unmodified.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <AlertDescription className="text-red-800">
                      ⚠️ TAMPER DETECTED! Hash chain broken. One or more entries have been modified.
                    </AlertDescription>
                  </>
                )}
              </Alert>

              {/* Chain Visualization */}
              <div className="mt-6 space-y-4">
                {entries.map((entry, index) => {
                  const isExpanded = expandedEntry === entry.id;
                  const isTampered = tamperedEntry === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isTampered
                          ? "border-red-500 bg-red-50"
                          : index > 0 && entries[index].previousHash !== entries[index - 1].hash
                          ? "border-red-400 bg-red-50/50"
                          : "border-slate-200 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {/* Chain Link */}
                      {index > 0 && (
                        <div className="absolute -top-4 left-8 w-0.5 h-4 bg-slate-300" />
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isTampered
                                ? "bg-red-500 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{entry.action}</div>
                            <div className="text-sm text-slate-500">
                              {entry.actor} • {formatDate(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {tamperMode && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => tamperWithEntry(entry.id)}
                            >
                              Tamper
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Hash Details */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Entry Hash:</span>
                            <code className="ml-2 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {formatHash(entry.hash)}
                            </code>
                          </div>
                          <div>
                            <span className="text-slate-500">Previous Hash:</span>
                            <code className="ml-2 font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {formatHash(entry.previousHash)}
                            </code>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                            <div className="text-slate-500 mb-1">Data:</div>
                            <div>{entry.data}</div>
                            <div className="mt-2 text-xs text-slate-400 font-mono break-all">
                              Full Hash: {entry.hash}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tamper Warning */}
                      {isTampered && (
                        <div className="mt-3 p-3 bg-red-100 text-red-800 rounded text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          This entry has been marked as tampered. All subsequent entries show hash
                          mismatch.
                        </div>
                      )}

                      {!isTampered &&
                        index > 0 &&
                        entries[index].previousHash !== entries[index - 1].hash && (
                          <div className="mt-3 p-3 bg-red-100 text-red-800 rounded text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Hash mismatch detected! Previous hash doesn't match.
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* Reset */}
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => {
                  setTamperedEntry(null);
                  setTamperMode(false);
                  generateHashChain();
                }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Chain
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Explanation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            How Hash Chains Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Hash className="w-5 h-5" />
              </div>
              <h4 className="font-medium">1. Each Entry Gets a Hash</h4>
              <p className="text-sm text-slate-500">
                Every action is hashed using SHA-256, creating a unique fingerprint of the data.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Link2 className="w-5 h-5" />
              </div>
              <h4 className="font-medium">2. Chain Links Together</h4>
              <p className="text-sm text-slate-500">
                Each entry includes the previous entry's hash, creating an unbreakable chain.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-medium">3. Tampering Detected</h4>
              <p className="text-sm text-slate-500">
                Any change breaks the chain. The mismatch is immediately visible and verifiable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
