import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  Database,
  Bell,
  Users,
  Vote,
  Unlock,
  UserCheck,
  ArrowRight,
  CheckCircle,
  Shield,
  FileText,
} from "lucide-react";

interface FlowStep {
  id: string;
  type: "asset" | "trigger" | "executor" | "quorum" | "release" | "beneficiary";
  label: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "asset",
    type: "asset",
    label: "Asset",
    description: "Digital asset",
    icon: <Database className="w-5 h-5" />,
    details: [
      "Crypto Wallets",
      "DeFi Positions",
      "Exchange Accounts",
      "Business Assets",
    ],
  },
  {
    id: "trigger",
    type: "trigger",
    label: "Trigger",
    description: "Activation condition",
    icon: <Bell className="w-5 h-5" />,
    details: [
      "Death certificate",
      "Incapacity notice",
      "Time delay",
      "Multi-confirmation",
    ],
  },
  {
    id: "executor",
    type: "executor",
    label: "Executor",
    description: "Will executor",
    icon: <UserCheck className="w-5 h-5" />,
    details: [
      "Verified identity",
      "Legal authority",
      "Multi-sig permission",
      "Audit trail",
    ],
  },
  {
    id: "quorum",
    type: "quorum",
    label: "Quorum",
    description: "Majority decision",
    icon: <Vote className="w-5 h-5" />,
    details: [
      "M-of-N signatures",
      "Time delay",
      "Objection period",
      "Consensus mechanism",
    ],
  },
  {
    id: "release",
    type: "release",
    label: "Release",
    description: "Release mechanism",
    icon: <Unlock className="w-5 h-5" />,
    details: [
      "Shamir Secret Sharing",
      "Time-lock contract",
      "Multi-Party Computation",
      "Zero-Knowledge Proof",
    ],
  },
  {
    id: "beneficiary",
    type: "beneficiary",
    label: "Beneficiary",
    description: "Recipient",
    icon: <Users className="w-5 h-5" />,
    details: [
      "Verified wallet",
      "Identity proof",
      "Tax compliance",
      "Documentation",
    ],
  },
];

interface PathConfig {
  id: string;
  name: string;
  description: string;
  steps: string[];
  color: string;
}

const PATHS: PathConfig[] = [
  {
    id: "standard",
    name: "Standard path",
    description: "Death → Executor → 2-of-3 Quorum → Release",
    steps: ["asset", "trigger", "executor", "quorum", "release", "beneficiary"],
    color: "bg-blue-500",
  },
  {
    id: "emergency",
    name: "Emergency path",
    description: "Incapacity → 3-of-5 Quorum → Immediate release",
    steps: ["asset", "trigger", "quorum", "release", "beneficiary"],
    color: "bg-red-500",
  },
  {
    id: "time",
    name: "Time-delayed path",
    description: "Time-lock → 30-day waiting period → Automatic release",
    steps: ["asset", "trigger", "quorum", "release", "beneficiary"],
    color: "bg-amber-500",
  },
];

export function GovernanceFlow() {
  const [selectedPath, setSelectedPath] = useState<string>("standard");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentPath = PATHS.find((p) => p.id === selectedPath)!;
  const pathSteps = currentPath.steps.map(
    (stepId) => FLOW_STEPS.find((s) => s.id === stepId)!
  );

  const runAnimation = () => {
    setIsAnimating(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= pathSteps.length) {
        clearInterval(interval);
        setIsAnimating(false);
      } else {
        setActiveStep(step);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Governance flow:</div>
        <div className="text-blue-600 dark:text-blue-400">
          Asset → Trigger → Executor → Quorum(m,n) → Release → Beneficiary
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Deterministic sequence with cryptographic verification at every level
        </div>
      </div>

      {/* Path Selection */}
      <div className="flex flex-wrap gap-2">
        {PATHS.map((path) => (
          <Button
            key={path.id}
            variant={selectedPath === path.id ? "default" : "outline"}
            onClick={() => {
              setSelectedPath(path.id);
              setActiveStep(0);
              setIsAnimating(false);
            }}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${path.color}`} />
            {path.name}
          </Button>
        ))}
        <Button
          variant="secondary"
          onClick={runAnimation}
          disabled={isAnimating}
          className="ml-auto"
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Simulate flow
        </Button>
      </div>

      {/* Flow Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{currentPath.name}</CardTitle>
              <p className="text-sm text-slate-500">{currentPath.description}</p>
            </div>
            {isAnimating && (
              <Badge variant="default" className="animate-pulse">
                Executing...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Horizontal Flow */}
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {pathSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[120px] ${
                    index <= activeStep && isAnimating
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : index === activeStep
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      index <= activeStep && isAnimating
                        ? "bg-green-500 text-white"
                        : index === activeStep
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {index < activeStep && isAnimating ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="font-medium text-sm text-center">{step.label}</div>
                  <div className="text-xs text-slate-500 text-center">
                    {step.description}
                  </div>
                  {index === activeStep && isAnimating && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
                {index < pathSteps.length - 1 && (
                  <ArrowRight
                    className={`w-6 h-6 mx-2 flex-shrink-0 ${
                      index < activeStep && isAnimating
                        ? "text-green-500"
                        : "text-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pathSteps.map((step, index) => (
          <Card
            key={step.id}
            className={
              index === activeStep
                ? "border-blue-300 ring-2 ring-blue-100"
                : ""
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <CardTitle className="text-sm">{step.label}</CardTitle>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {step.details.map((detail, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Features */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <CardTitle className="text-base">Security features</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Cryptographic verification</span>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                Every step is verified through digital signatures and zero-knowledge proofs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Multi-party governance</span>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                No single person can control the process alone — consensus required.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Audit trail</span>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                Every action is immutably logged for legal traceability.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Time-lock protection</span>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                Optional delays prevent premature or fraudulent transfers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
