import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldCheck, Clock, AlertTriangle, Siren, HeartPulse,
  CheckCircle2, Users, KeyRound, Activity, Download,
} from "lucide-react";
import { useGovernanceStore } from "@/store/governance";

const STAGE_META = [
  { label: "Warning 1", desc: "First notification sent to primary contacts", color: "text-amber-500", bg: "bg-amber-500" },
  { label: "Warning 2", desc: "Escalation to secondary contacts and guardians", color: "text-orange-500", bg: "bg-orange-500" },
  { label: "Warning 3", desc: "Final notice — imminent key distribution", color: "text-red-500", bg: "bg-red-500" },
  { label: "Triggered", desc: "Key fragments distributed, Transfer Gate activated", color: "text-red-700", bg: "bg-red-700" },
];

export default function SuccessionSentinel() {
  const {
    deadManSwitch, dmsConfig, checkIn, toggleDMS, updateDMSConfig,
    getTimeUntilTrigger, getDmsStatusColor,
    getDaiScore, getDaiScoreBreakdown,
    beneficiaries, keyFragments, emergencyProtocol,
    inheritanceContainer, auditTrail,
  } = useGovernanceStore();

  const [emergencyReason, setEmergencyReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeError, setChallengeError] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const triggerEmergency = useGovernanceStore((s) => s.triggerEmergency);
  const setChallengeQuestions = useGovernanceStore((s) => s.setChallengeQuestions);
  const getActiveChallenge = useGovernanceStore((s) => s.getActiveChallenge);
  const activeChallenge = getActiveChallenge();

  const score = getDaiScore();
  const breakdown = getDaiScoreBreakdown();
  const scoreColor = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500";
  const strokeColor = score >= 70 ? "stroke-emerald-500" : score >= 40 ? "stroke-amber-500" : "stroke-red-500";

  // Time-based urgency
  const lastActivity = auditTrail.length > 0 ? auditTrail[0].timestamp : 0;
  const daysSinceActivity = lastActivity > 0 ? Math.floor((Date.now() - lastActivity) / (24 * 60 * 60 * 1000)) : -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-lg font-bold">Succession Sentinel</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Achievement Badge */}
        {score >= 90 && (
          <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-400">Succession Ready</p>
            <p className="text-xs text-muted-foreground">Your digital estate is documented and secured via DAIO Governance Framework.</p>
          </div>
        )}

        {/* Time-based urgency */}
        {daysSinceActivity > 14 && score < 70 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>No governance activity in {daysSinceActivity} days. Your Score is {score}/100 — unprotected assets remain at risk.</span>
          </div>
        )}

        {/* DAIO Score + DMS Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAIO Governance Score */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                      strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`}
                      strokeLinecap="round" className={strokeColor} stroke="currentColor" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${scoreColor}`}>{score}</span>
                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Governance Score</h3>
                  <div className="space-y-1">
                    {breakdown.map((b) => (
                      <div key={b.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{b.label}</span>
                        <span className="font-medium">{b.score}/{b.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DMS Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#c9a54e]" />
                  Dead Man's Switch
                </CardTitle>
                <Badge variant="outline" className={getDmsStatusColor()}>
                  {deadManSwitch.status === "inactive" ? "Disabled" : deadManSwitch.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Sentinel</Label>
                <Switch checked={deadManSwitch.enabled} onCheckedChange={toggleDMS} />
              </div>

              {deadManSwitch.enabled && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next check-in</span>
                    <span className={`font-medium ${getDmsStatusColor()}`}>{getTimeUntilTrigger()}</span>
                  </div>
                  {activeChallenge ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{activeChallenge.question}</p>
                      <Input
                        placeholder="Your answer..."
                        value={challengeAnswer}
                        onChange={(e) => { setChallengeAnswer(e.target.value); setChallengeError(false); }}
                        className={challengeError ? "border-red-500" : ""}
                      />
                      {challengeError && <p className="text-xs text-red-500">Incorrect answer. Try again.</p>}
                      <Button
                        onClick={() => {
                          const ok = checkIn(challengeAnswer);
                          if (ok) { setChallengeAnswer(""); setChallengeError(false); }
                          else setChallengeError(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={!challengeAnswer.trim()}
                      >
                        <HeartPulse className="w-4 h-4 mr-2" /> Verify & Check In
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => checkIn()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <HeartPulse className="w-4 h-4 mr-2" /> Proof of Life Check-In
                    </Button>
                  )}
                </>
              )}

              <div>
                <Label className="text-xs">Check-in Interval</Label>
                <Select
                  value={String(deadManSwitch.intervalMonths)}
                  onValueChange={(v) => updateDMSConfig({ stage1Days: Number(v) * 30 })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Every 3 months</SelectItem>
                    <SelectItem value="6">Every 6 months</SelectItem>
                    <SelectItem value="12">Every 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Challenge Questions */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">Challenge Questions ({deadManSwitch.challengeQuestions.length})</Label>
                {deadManSwitch.challengeQuestions.map((q, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-accent/30 flex items-center justify-between">
                    <span className="truncate">{q.question}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => setChallengeQuestions(deadManSwitch.challengeQuestions.filter((_, j) => j !== i))}>
                      &times;
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="text-xs" />
                  <Input placeholder="Answer" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="text-xs w-28" />
                  <Button size="sm" variant="outline" className="shrink-0 text-xs"
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    onClick={() => {
                      setChallengeQuestions([...deadManSwitch.challengeQuestions, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
                      setNewQuestion(""); setNewAnswer("");
                    }}>
                    +
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Only you know the answers. A random question is asked at each check-in.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score-based Recommendations */}
        {score < 100 && (
          <Card className="border-[#c9a54e]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!deadManSwitch.enabled && (
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/30">
                    <HeartPulse className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Enable the Succession Sentinel to activate dead man's switch protection (+20 pts)</span>
                  </div>
                )}
                {beneficiaries.length === 0 && (
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/30">
                    <Users className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Add at least one beneficiary — heir, guardian, or notary (+5 pts)</span>
                  </div>
                )}
                {keyFragments.length === 0 && beneficiaries.length > 0 && (
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/30">
                    <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Generate Shamir key fragments in the Inheritance Vault (+20 pts)</span>
                  </div>
                )}
                {inheritanceContainer.lastUpdated === 0 && (
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/30">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Start documenting your Inheritance Container (+10 pts)</span>
                  </div>
                )}
                {!beneficiaries.some((b) => b.role === "notary") && beneficiaries.length > 0 && (
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-accent/30">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Designate a notary for legal verification (+5 pts)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Escalation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5" /> Escalation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-0">
              {STAGE_META.map((stage, i) => {
                const isActive = deadManSwitch.warningsSent > i;
                const isCurrent = deadManSwitch.status === `warning_${i + 1}` || (i === 3 && deadManSwitch.status === "triggered");
                return (
                  <div key={stage.label} className="flex-1 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-sm mb-2 transition-all ${
                      isCurrent ? `${stage.bg}/20 border-current ${stage.color} shadow-lg` :
                      isActive ? `${stage.bg}/20 border-current ${stage.color}` :
                      "border-muted bg-muted/20 text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <p className={`text-xs font-semibold ${isCurrent ? stage.color : "text-muted-foreground"}`}>{stage.label}</p>
                    <p className="text-[10px] text-muted-foreground text-center mt-1 hidden sm:block">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
              Stage intervals: {dmsConfig.stage1Days}d → {dmsConfig.stage2Days}d → {dmsConfig.stage3Days}d → +72h trigger
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-[#c9a54e]" />
              <p className="text-2xl font-bold">{beneficiaries.length}</p>
              <p className="text-xs text-muted-foreground">Beneficiaries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <KeyRound className="w-5 h-5 mx-auto mb-1 text-[#c9a54e]" />
              <p className="text-2xl font-bold">{keyFragments.length}</p>
              <p className="text-xs text-muted-foreground">Key Fragments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-[#c9a54e]" />
              <p className="text-2xl font-bold">L{inheritanceContainer.level}</p>
              <p className="text-xs text-muted-foreground">Container Level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-[#c9a54e]" />
              <p className="text-2xl font-bold">{auditTrail.length}</p>
              <p className="text-xs text-muted-foreground">Audit Entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Protocol */}
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-500">
              <Siren className="w-5 h-5" /> Emergency Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyProtocol.enabled ? (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Emergency protocol active since {new Date(emergencyProtocol.lastTriggered!).toLocaleString()}.
                  Reason: {emergencyProtocol.reason}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Activating the emergency protocol will regenerate all key fragments and engage the transfer gate.
                </p>
                <Input
                  placeholder="Reason for emergency activation"
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                />
                <Input
                  placeholder='Type "EMERGENCY" to confirm'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                <Button
                  variant="destructive"
                  disabled={confirmText !== "EMERGENCY" || !emergencyReason.trim()}
                  onClick={() => { triggerEmergency(emergencyReason); setEmergencyReason(""); setConfirmText(""); }}
                  className="w-full"
                >
                  <Siren className="w-4 h-4 mr-2" /> Activate Emergency Protocol
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Audit Trail (last 10) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Recent Audit Trail
              </CardTitle>
              {auditTrail.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {auditTrail.length} total · {auditTrail.filter((e) => Date.now() - e.timestamp < 30 * 24 * 60 * 60 * 1000).length} in last 30 days
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {auditTrail.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audit entries yet.</p>
            ) : (
              <div className="space-y-2">
                {auditTrail.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg bg-accent/20 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      e.type === "success" ? "bg-emerald-500" :
                      e.type === "warning" ? "bg-amber-500" :
                      e.type === "critical" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{e.action}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{e.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Governance Report */}
        <Card>
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Governance Report</p>
              <p className="text-xs text-muted-foreground">Export your current governance status for advisors, notaries, or compliance records.</p>
            </div>
            <Button variant="outline" onClick={() => exportReport(score, breakdown, beneficiaries, keyFragments, deadManSwitch, inheritanceContainer, auditTrail)}>
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function exportReport(
  score: number,
  breakdown: { label: string; score: number; max: number }[],
  beneficiaries: { name: string; role: string }[],
  keyFragments: { holder: string; status: string }[],
  dms: { enabled: boolean; status: string; lastCheckIn: number },
  ic: { level: number; lastUpdated: number },
  audit: { timestamp: number; action: string; details: string }[],
) {
  const now = new Date().toISOString();
  const lines = [
    "DAIO GOVERNANCE REPORT",
    `Generated: ${now}`,
    `Framework: Digital Asset Inheritance Orchestration`,
    "",
    "═══ GOVERNANCE SCORE ═══",
    `Overall: ${score} / 100`,
    ...breakdown.map((b) => `  ${b.label}: ${b.score}/${b.max}`),
    "",
    "═══ SUCCESSION SENTINEL ═══",
    `Status: ${dms.enabled ? dms.status.toUpperCase() : "DISABLED"}`,
    `Last Check-In: ${dms.lastCheckIn ? new Date(dms.lastCheckIn).toISOString() : "Never"}`,
    "",
    "═══ INHERITANCE CONTAINER ═══",
    `Level: ${ic.level}/3`,
    `Last Updated: ${ic.lastUpdated ? new Date(ic.lastUpdated).toISOString() : "Not started"}`,
    "",
    "═══ BENEFICIARIES ═══",
    ...(beneficiaries.length > 0 ? beneficiaries.map((b) => `  ${b.name} (${b.role})`) : ["  None designated"]),
    "",
    "═══ KEY FRAGMENTS ═══",
    `Total: ${keyFragments.length}`,
    ...(keyFragments.length > 0 ? keyFragments.map((f) => `  ${f.holder}: ${f.status}`) : []),
    "",
    "═══ RECENT AUDIT (last 20) ═══",
    ...audit.slice(0, 20).map((e) => `  [${new Date(e.timestamp).toISOString()}] ${e.action}: ${e.details}`),
    "",
    "───",
    "DAIO — Digital Asset Inheritance Orchestration",
    "Back2IQ — Ahead by Design",
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daio-governance-report-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
