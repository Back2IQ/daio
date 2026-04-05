// DAIO Vault Protocol — Interactive Demo
// Step-by-step walkthrough of the complete Shamir Vault Protocol

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  ChevronRight,
  ChevronLeft,
  Shield,
  Split,
  Users,
  ShieldCheck,
  Unlock,
  Bug,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  KeyRound,
} from "lucide-react";

import type { Shard } from "../../types";
import { generateShares, reconstructSecret, generateFeldmanCommitments, verifyShare } from "../../utils/shamir";

interface DemoStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const STEPS: DemoStep[] = [
  {
    id: "problem",
    title: "Das Problem",
    subtitle: "Warum ein einzelner Schlüssel gefährlich ist",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "bg-red-500",
  },
  {
    id: "split",
    title: "Der Split",
    subtitle: "Secret mathematisch aufteilen",
    icon: <Split className="w-5 h-5" />,
    color: "bg-blue-500",
  },
  {
    id: "distribute",
    title: "Die Verteilung",
    subtitle: "Shards an Validatoren verteilen",
    icon: <Users className="w-5 h-5" />,
    color: "bg-indigo-500",
  },
  {
    id: "verify",
    title: "Die Verifikation",
    subtitle: "Feldman VSS — Zero-Knowledge Proof",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "bg-emerald-500",
  },
  {
    id: "reconstruct",
    title: "Die Rekonstruktion",
    subtitle: "Shards zusammenführen → Secret erscheint",
    icon: <Unlock className="w-5 h-5" />,
    color: "bg-green-500",
  },
  {
    id: "honeypot",
    title: "Der Honeypot",
    subtitle: "Angreifer-Erkennung & Canary Shards",
    icon: <Bug className="w-5 h-5" />,
    color: "bg-amber-500",
  },
  {
    id: "zeroknowledge",
    title: "Zero Knowledge",
    subtitle: "T-1 Shards = ZERO Information — Beweis",
    icon: <EyeOff className="w-5 h-5" />,
    color: "bg-purple-500",
  },
];

export function VaultDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoSecret, setDemoSecret] = useState("DAIO-Demo-Secret-2026");
  const [demoShards, setDemoShards] = useState<Shard[]>([]);
  const [demoCommitments, setDemoCommitments] = useState<string[]>([]);
  const [reconstructedDemo, setReconstructedDemo] = useState("");
  const [partialResult, setPartialResult] = useState("");
  const [verificationResults, setVerificationResults] = useState<boolean[]>([]);
  const [demoStarted, setDemoStarted] = useState(false);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const startDemo = useCallback(() => {
    try {
      const { shards, coefficients } = generateShares(demoSecret, 3, 5, "demo-vault");
      const feldman = generateFeldmanCommitments(coefficients);

      setDemoShards(shards);
      setDemoCommitments(feldman.commitments);

      // Verify all shards
      const results = shards.map((s) => verifyShare(s, feldman));
      setVerificationResults(results);

      // Reconstruct with 3 shards
      const reconstructed = reconstructSecret(shards.slice(0, 3));
      setReconstructedDemo(reconstructed);

      // Try with 2 shards (should fail / give garbage)
      try {
        const partial = reconstructSecret(shards.slice(0, 2));
        setPartialResult(partial);
      } catch {
        setPartialResult("[FEHLER: Rekonstruktion unmöglich]");
      }

      coefficients.fill(0n);
      setDemoStarted(true);
    } catch (err) {
      setPartialResult(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }, [demoSecret]);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const reset = () => {
    setCurrentStep(0);
    setDemoStarted(false);
    setDemoShards([]);
    setReconstructedDemo("");
    setPartialResult("");
    setVerificationResults([]);
  };

  const renderStepContent = () => {
    switch (step.id) {
      case "problem":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                <CardContent className="pt-6">
                  <h4 className="font-bold text-red-700 mb-3">
                    Ohne Shamir (Single Key)
                  </h4>
                  <ul className="space-y-2 text-sm text-red-600">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Schlüssel verloren = Alles verloren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Person stirbt = Kein Zugang mehr</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Eine kompromittierte Kopie = Total-Verlust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Kein Backup-Plan, kein Redundanz</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                <CardContent className="pt-6">
                  <h4 className="font-bold text-green-700 mb-3">
                    Mit Shamir (T-von-N Threshold)
                  </h4>
                  <ul className="space-y-2 text-sm text-green-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>N-T Personen können ausfallen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Kein Single Point of Failure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        T-1 Shards = mathematisch ZERO Information
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Post-Quantum sicher (algebraisch)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {!demoStarted && (
              <div className="text-center">
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Demo-Secret (kann geändert werden):
                  </label>
                  <Input
                    value={demoSecret}
                    onChange={(e) => setDemoSecret(e.target.value)}
                    className="max-w-md mx-auto font-mono text-center"
                  />
                </div>
                <Button size="lg" onClick={startDemo}>
                  <Play className="w-5 h-5 mr-2" />
                  Demo starten (3-von-5 Threshold)
                </Button>
              </div>
            )}
          </div>
        );

      case "split":
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
              <Split className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Das Secret "<strong>{demoSecret}</strong>" wurde mit einem
                Polynom vom Grad 2 (Threshold-1) in 5 Shards aufgeteilt. Jeder
                Shard ist ein Punkt auf der geheimen Kurve.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {demoShards.map((shard) => (
                <Card key={shard.index} className="text-center">
                  <CardContent className="pt-4 pb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">
                      {shard.index}
                    </div>
                    <div className="text-xs font-medium">
                      Shard #{shard.index}
                    </div>
                    <code className="text-[10px] text-muted-foreground font-mono block mt-1 truncate">
                      {shard.value.slice(0, 12)}...
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="pt-4">
                <p className="text-sm text-center">
                  <strong>Mathematik:</strong> f(x) = secret + a₁x + a₂x² mod p
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Jeder Shard = (x, f(x)) — ein Punkt auf dem geheimen Polynom
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "distribute":
        return (
          <div className="space-y-4">
            <div className="relative">
              {/* Central vault */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <KeyRound className="w-8 h-8" />
                </div>
              </div>

              {/* Distribution lines */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: "Erbe A", role: "Primärerbe", icon: "👤" },
                  { label: "Notar", role: "Versiegelter Umschlag", icon: "📜" },
                  { label: "Anwalt", role: "Tresor", icon: "⚖️" },
                  { label: "Trustee", role: "Kurier", icon: "🏛️" },
                  { label: "Banksafe", role: "Schließfach", icon: "🏦" },
                ].map((recipient, i) => (
                  <Card
                    key={i}
                    className="text-center border-2 border-indigo-200"
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="text-2xl mb-1">{recipient.icon}</div>
                      <div className="text-xs font-bold">{recipient.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {recipient.role}
                      </div>
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        Shard #{i + 1}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Alert className="bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20">
              <Users className="w-4 h-4 text-indigo-600" />
              <AlertDescription className="text-indigo-800 dark:text-indigo-200">
                Jeder Validator erhält genau einen Shard über einen separaten,
                sicheren Kanal. Kein einzelner Validator kann das Secret alleine
                rekonstruieren. Selbst wenn 2 Validatoren zusammenarbeiten
                (weniger als T=3), erfahren sie NICHTS über das Secret.
              </AlertDescription>
            </Alert>
          </div>
        );

      case "verify":
        return (
          <div className="space-y-4">
            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                Feldman VSS: Jeder Validator kann prüfen, ob sein Shard gültig
                ist — ohne den Shard jemandem zu zeigen und ohne etwas über das
                Secret zu erfahren.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {demoShards.map((shard, i) => (
                <div
                  key={shard.index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    verificationResults[i]
                      ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                      : "border-red-300 bg-red-50 dark:bg-red-900/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verificationResults[i] ? (
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm">Shard #{shard.index}</span>
                  </div>
                  <Badge
                    variant={
                      verificationResults[i] ? "secondary" : "destructive"
                    }
                  >
                    {verificationResults[i]
                      ? "g^(shard) = ∏ C_j^(i^j) ✓"
                      : "Verifikation fehlgeschlagen"}
                  </Badge>
                </div>
              ))}
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="pt-4">
                <p className="text-sm text-center">
                  <strong>Commitments veröffentlicht:</strong>{" "}
                  {demoCommitments.length} Werte
                  <br />
                  <span className="text-xs text-muted-foreground">
                    C₀ = {demoCommitments[0]?.slice(0, 16)}... | C₁ ={" "}
                    {demoCommitments[1]?.slice(0, 16)}... | C₂ ={" "}
                    {demoCommitments[2]?.slice(0, 16)}...
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "reconstruct":
        return (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
              <Unlock className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                3 von 5 Validatoren kommen zusammen. Ihre Shards werden per
                Lagrange-Interpolation kombiniert. Das Secret erscheint.
              </AlertDescription>
            </Alert>

            {/* Show which shards are used */}
            <div className="grid grid-cols-5 gap-2">
              {demoShards.map((shard, i) => (
                <Card
                  key={shard.index}
                  className={`text-center ${
                    i < 3
                      ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                      : "opacity-40"
                  }`}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="text-xs font-bold">
                      Shard #{shard.index}
                    </div>
                    <Badge
                      variant={i < 3 ? "secondary" : "outline"}
                      className="mt-1 text-[10px]"
                    >
                      {i < 3 ? "VERWENDET" : "Nicht nötig"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Result */}
            <Card className="border-2 border-green-500">
              <CardContent className="pt-6 pb-6 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-2">
                  Rekonstruiertes Secret:
                </p>
                <code className="text-lg font-mono font-bold text-green-700 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                  {reconstructedDemo}
                </code>
                <p className="text-xs text-muted-foreground mt-3">
                  {reconstructedDemo === demoSecret ? (
                    <span className="text-green-600">
                      ✓ Perfekte Übereinstimmung mit dem Original!
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ✗ Stimmt nicht überein — Fehler bei der Rekonstruktion
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "honeypot":
        return (
          <div className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20">
              <Bug className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Honeypot-Container sehen identisch aus wie echte Container.
                Canary-Shards lösen bei Verwendung einen stillen Alert aus.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Echter Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>Label: Haupt-BTC-Wallet</div>
                  <div>Threshold: 3 von 5</div>
                  <div>Shards: 5 echte</div>
                  <Badge className="bg-green-500">ECHT</Badge>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/5">
                <CardHeader>
                  <CardTitle className="text-sm text-amber-700 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Honeypot Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>Label: Haupt-BTC-Wallet</div>
                  <div>
                    Threshold: 2 von 3{" "}
                    <span className="text-xs text-amber-600">(niedriger!)</span>
                  </div>
                  <div>Shards: 3 Canary</div>
                  <Badge className="bg-amber-500">FALLE</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-red-50 dark:bg-red-900/10 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-red-700">Szenario:</strong> Ein
                    Angreifer findet Canary-Shards und versucht die
                    Rekonstruktion.
                    <br />→ System erkennt Canary-Shard automatisch
                    <br />→ Alert wird an ALLE echten Validatoren gesendet
                    <br />→ Angreifer erhält ein wertloses Fake-Secret
                    <br />→ Zugriffsversuch wird protokolliert
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "zeroknowledge":
        return (
          <div className="space-y-4">
            <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20">
              <EyeOff className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                <strong>Informationstheoretischer Beweis:</strong> Weniger als T
                Shards verraten ZERO Information über das Secret. Nicht "schwer
                zu knacken" — mathematisch UNMÖGLICH.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                <CardHeader>
                  <CardTitle className="text-sm text-green-700">
                    3 Shards (= T) → Secret ✓
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm font-mono block bg-white dark:bg-slate-800 p-2 rounded mb-2">
                    {reconstructedDemo || "..."}
                  </code>
                  <Badge className="bg-green-500">Perfekte Rekonstruktion</Badge>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="text-sm text-red-700">
                    2 Shards (&lt; T) → Nichts ✗
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm font-mono block bg-white dark:bg-slate-800 p-2 rounded mb-2 break-all">
                    {partialResult
                      ? partialResult.length > 40
                        ? partialResult.slice(0, 40) + "... (Müll)"
                        : partialResult
                      : "[Unvorhersagbarer Output]"}
                  </code>
                  <Badge className="bg-red-500">
                    Komplett falsches Ergebnis
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-2xl font-bold text-green-600">∞</div>
                    <div className="text-xs text-muted-foreground">
                      Mögliche Secrets bei T-1 Shards
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-xs text-muted-foreground">
                      Bits Information durchgesickert
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      2²⁵⁶
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Feldgröße (post-quantum sicher)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Step Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Schritt {currentStep + 1} von {STEPS.length}
            </span>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => demoStarted && setCurrentStep(i)}
                className={`flex flex-col items-center gap-1 ${
                  !demoStarted && i > 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={!demoStarted && i > 0}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                    i <= currentStep ? s.color : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground hidden md:block">
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center text-white`}
              >
                {step.icon}
              </div>
              <div>
                <CardTitle>{step.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {step.subtitle}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>

          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button
            onClick={nextStep}
            disabled={currentStep === STEPS.length - 1 || !demoStarted}
          >
            Weiter
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
