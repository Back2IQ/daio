// App 1: Inheritance Incident Simulator
// Simulates inheritance scenarios showing where governance breaks

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileX,
  ShieldAlert,
  Skull,
  HeartPulse,
  UserX,
  ChevronRight,
  Download,
} from "lucide-react";
import { toPng } from "html-to-image";
import type { PortfolioType, TriggerType } from "../../types";

interface SimulationStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  withoutDaio: {
    status: "fail" | "delay" | "chaos" | "success";
    details: string;
    timeCost: string;
    financialCost: string;
  };
  withDaio: {
    status: "success" | "smooth";
    details: string;
    timeCost: string;
    financialCost: string;
  };
}

const TRIGGER_TYPES: { id: TriggerType; label: string; icon: React.ReactNode }[] = [
  { id: "death", label: "Death of Owner", icon: <Skull className="w-4 h-4" /> },
  { id: "incapacity", label: "Incapacity", icon: <HeartPulse className="w-4 h-4" /> },
  { id: "keyPerson", label: "Key Person Event", icon: <UserX className="w-4 h-4" /> },
];

const PORTFOLIO_TYPES: { id: PortfolioType; label: string }[] = [
  { id: "crypto-heavy", label: "Crypto-Heavy Portfolio" },
  { id: "entrepreneur", label: "Entrepreneur Assets" },
  { id: "rwa", label: "RWA Hybrid" },
  { id: "defi", label: "DeFi Risk Profile" },
  { id: "balanced", label: "Balanced Portfolio" },
];

const SIMULATION_STEPS: SimulationStep[] = [
  {
    id: "discovery",
    phase: "Discovery",
    title: "Asset Discovery",
    description: "Family/Executors try to identify all digital assets",
    withoutDaio: {
      status: "chaos",
      details: "Scattered information, no central registry. Family searching through emails, devices, and notes.",
      timeCost: "3-6 months",
      financialCost: "€5,000-15,000",
    },
    withDaio: {
      status: "smooth",
      details: "Complete asset inventory with hints and custody information immediately available.",
      timeCost: "1-2 weeks",
      financialCost: "€500-1,000",
    },
  },
  {
    id: "verification",
    phase: "Verification",
    title: "Identity & Rights Verification",
    description: "Prove authority to access accounts and assets",
    withoutDaio: {
      status: "delay",
      details: "Death certificates, legal documents, court orders required. Each platform has different process.",
      timeCost: "2-4 months",
      financialCost: "€10,000-30,000",
    },
    withDaio: {
      status: "smooth",
      details: "Pre-defined verification checklist with required documents and witnesses.",
      timeCost: "2-4 weeks",
      financialCost: "€2,000-5,000",
    },
  },
  {
    id: "access",
    phase: "Access",
    title: "Account Access Recovery",
    description: "Gain access to exchanges, wallets, and platforms",
    withoutDaio: {
      status: "fail",
      details: "Self-custody assets may be permanently lost. Exchange accounts require extensive verification.",
      timeCost: "6-12+ months",
      financialCost: "€20,000-100,000+",
    },
    withDaio: {
      status: "success",
      details: "Executors know custody types and have documented recovery procedures.",
      timeCost: "1-2 months",
      financialCost: "€5,000-10,000",
    },
  },
  {
    id: "quorum",
    phase: "Governance",
    title: "Multi-Signature / Quorum Requirements",
    description: "Handle assets requiring multiple approvals",
    withoutDaio: {
      status: "fail",
      details: "No designated backup signers. Assets locked in multi-sig with no recovery path.",
      timeCost: "Potentially permanent",
      financialCost: "Total loss possible",
    },
    withDaio: {
      status: "success",
      details: "Pre-defined quorum requirements and backup signers documented.",
      timeCost: "1-3 weeks",
      financialCost: "€1,000-3,000",
    },
  },
  {
    id: "transfer",
    phase: "Transfer",
    title: "Asset Transfer to Beneficiaries",
    description: "Distribute assets according to wishes",
    withoutDaio: {
      status: "chaos",
      details: "Unclear intentions lead to family disputes. Tax implications not considered.",
      timeCost: "6-24 months",
      financialCost: "€30,000-150,000",
    },
    withDaio: {
      status: "smooth",
      details: "Clear policies, designated beneficiaries, and tax-optimized transfer plan.",
      timeCost: "1-3 months",
      financialCost: "€5,000-15,000",
    },
  },
];

export function IncidentSimulator() {
  const [scenario, setScenario] = useState<TriggerType>("death");
  const [portfolio, setPortfolio] = useState<PortfolioType>("crypto-heavy");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [captureRef, setCaptureRef] = useState<HTMLDivElement | null>(null);

  const startSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setCompleted(false);
  };

  const nextStep = () => {
    if (currentStep < SIMULATION_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCompleted(false);
  };

  const exportReport = async () => {
    if (captureRef) {
      const dataUrl = await toPng(captureRef, { quality: 0.95 });
      const link = document.createElement("a");
      link.download = `daio-simulation-report-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fail":
        return <FileX className="w-5 h-5 text-red-500" />;
      case "delay":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "chaos":
        return <ShieldAlert className="w-5 h-5 text-orange-500" />;
      case "success":
      case "smooth":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "fail":
        return <Badge variant="destructive">Blocked</Badge>;
      case "delay":
        return <Badge className="bg-amber-500">Delayed</Badge>;
      case "chaos":
        return <Badge className="bg-orange-500">Chaos</Badge>;
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "smooth":
        return <Badge className="bg-blue-500">Smooth</Badge>;
      default:
        return null;
    }
  };

  // Parse cost ranges like "€5,000-15,000" → average of range (10,000)
  const parseCostRange = (costStr: string): number => {
    const numbers = costStr.match(/[\d,]+/g);
    if (!numbers || numbers.length === 0) return 0;
    const parsed = numbers.map((n) => parseInt(n.replace(/,/g, "")) || 0);
    return Math.round(parsed.reduce((a, b) => a + b, 0) / parsed.length);
  };

  // Parse time ranges like "3-6 months" → average in months (4.5)
  const parseTimeRange = (timeStr: string): number => {
    const numbers = timeStr.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;
    const avg = numbers.map(Number).reduce((a, b) => a + b, 0) / numbers.length;
    return timeStr.includes("week") ? avg / 4 : avg;
  };

  // Calculate totals
  const calculateTotals = () => {
    let timeWithout = 0;
    let timeWith = 0;
    let costWithout = 0;
    let costWith = 0;

    SIMULATION_STEPS.slice(0, currentStep + 1).forEach((step) => {
      timeWithout += parseTimeRange(step.withoutDaio.timeCost);
      timeWith += parseTimeRange(step.withDaio.timeCost);
      costWithout += parseCostRange(step.withoutDaio.financialCost);
      costWith += parseCostRange(step.withDaio.financialCost);
    });

    return { timeWithout, timeWith, costWithout, costWith };
  };

  const totals = calculateTotals();

  return (
    <div className="p-6" ref={setCaptureRef}>
      {/* Configuration */}
      {!isRunning && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Configure Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Incident Type</label>
                <Select
                  value={scenario}
                  onValueChange={(v: TriggerType) => setScenario(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          {t.icon}
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Portfolio Type</label>
                <Select
                  value={portfolio}
                  onValueChange={(v: PortfolioType) => setPortfolio(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTFOLIO_TYPES.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={startSimulation} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Simulation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulation Running */}
      {isRunning && (
        <>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Simulation Progress</span>
              <span>
                Step {currentStep + 1} of {SIMULATION_STEPS.length}
              </span>
            </div>
            <Progress
              value={((currentStep + 1) / SIMULATION_STEPS.length) * 100}
              className="h-2"
            />
          </div>

          {/* Current Step */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {SIMULATION_STEPS[currentStep].phase}
                  </Badge>
                  <CardTitle>{SIMULATION_STEPS[currentStep].title}</CardTitle>
                </div>
                {!completed && (
                  <Button onClick={nextStep}>
                    {currentStep < SIMULATION_STEPS.length - 1 ? (
                      <>
                        Next Step
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Complete
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-slate-500">
                {SIMULATION_STEPS[currentStep].description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Without DAIO */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    Without DAIO
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3 mb-3">
                      {getStatusIcon(SIMULATION_STEPS[currentStep].withoutDaio.status)}
                      {getStatusBadge(SIMULATION_STEPS[currentStep].withoutDaio.status)}
                    </div>
                    <p className="text-sm mb-4">
                      {SIMULATION_STEPS[currentStep].withoutDaio.details}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {SIMULATION_STEPS[currentStep].withoutDaio.timeCost}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        {SIMULATION_STEPS[currentStep].withoutDaio.financialCost}
                      </div>
                    </div>
                  </div>
                </div>

                {/* With DAIO */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    With DAIO
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3 mb-3">
                      {getStatusIcon(SIMULATION_STEPS[currentStep].withDaio.status)}
                      {getStatusBadge(SIMULATION_STEPS[currentStep].withDaio.status)}
                    </div>
                    <p className="text-sm mb-4">
                      {SIMULATION_STEPS[currentStep].withDaio.details}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {SIMULATION_STEPS[currentStep].withDaio.timeCost}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        {SIMULATION_STEPS[currentStep].withDaio.financialCost}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Running Totals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Running Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xs text-slate-500">Time (No DAIO)</div>
                  <div className="text-lg font-bold text-red-600">
                    ~{totals.timeWithout} months
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-slate-500">Time (With DAIO)</div>
                  <div className="text-lg font-bold text-green-600">
                    ~{totals.timeWith} months
                  </div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xs text-slate-500">Cost (No DAIO)</div>
                  <div className="text-lg font-bold text-red-600">
                    €{totals.costWithout.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-slate-500">Cost (With DAIO)</div>
                  <div className="text-lg font-bold text-green-600">
                    €{totals.costWith.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            {completed && (
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </>
      )}

      {/* Summary */}
      {completed && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-6 h-6" />
              Simulation Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-5 h-5" />
                <AlertDescription>
                  Without DAIO governance, this scenario could result in significant delays,
                  costs, and potential permanent loss of assets. DAIO provides structure,
                  clarity, and auditability throughout the process.
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Time Saved</div>
                  <div className="text-2xl font-bold text-green-600">
                    {totals.timeWithout - totals.timeWith} months
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Cost Saved</div>
                  <div className="text-2xl font-bold text-green-600">
                    €{(totals.costWithout - totals.costWith).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Conflict Potential</div>
                  <div className="text-2xl font-bold text-amber-600">High → Low</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
