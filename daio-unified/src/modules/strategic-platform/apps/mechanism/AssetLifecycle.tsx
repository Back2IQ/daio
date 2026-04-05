import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Plus,
  Shield,
  Users,
  FileText,
  Bell,
  Unlock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Wallet,
  Landmark,
  Database,
} from "lucide-react";

interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  daioRole: string;
  activities: string[];
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: "acquisition",
    name: "Acquisition",
    description: "Acquiring new digital assets",
    icon: <Plus className="w-5 h-5" />,
    color: "bg-green-500",
    daioRole: "Asset registration & categorization",
    activities: [
      "Document wallet creation",
      "Assign asset category",
      "Initialize recovery plan",
      "Nominate executor",
    ],
  },
  {
    id: "custody",
    name: "Custody",
    description: "Secure asset storage",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-blue-500",
    daioRole: "Governance layer activation",
    activities: [
      "Multi-sig setup",
      "Backup verification",
      "Define access policies",
      "Store emergency contacts",
    ],
  },
  {
    id: "growth",
    name: "Growth & Management",
    description: "Active portfolio management",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-purple-500",
    daioRole: "Continuous documentation",
    activities: [
      "Track position updates",
      "Register new assets",
      "Adapt governance rules",
      "Conduct annual reviews",
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring",
    description: "Continuous status oversight",
    icon: <Bell className="w-5 h-5" />,
    color: "bg-amber-500",
    daioRole: "Health checks & alerts",
    activities: [
      "Check wallet health",
      "Executor availability",
      "Documentation completeness",
      "Compliance status",
    ],
  },
  {
    id: "transition",
    name: "Transition",
    description: "Succession activation",
    icon: <Users className="w-5 h-5" />,
    color: "bg-orange-500",
    daioRole: "Trigger execution & verification",
    activities: [
      "Verify trigger condition",
      "Authenticate executor",
      "Form quorum",
      "Start objection period",
    ],
  },
  {
    id: "execution",
    name: "Execution",
    description: "Asset transfer to beneficiaries",
    icon: <Unlock className="w-5 h-5" />,
    color: "bg-red-500",
    daioRole: "Secure release & transfer",
    activities: [
      "Key reconstruction",
      "Execute asset transfer",
      "Tax documentation",
      "Completion protocol",
    ],
  },
];

interface AssetExample {
  id: string;
  name: string;
  icon: React.ReactNode;
  stage: string;
  value: number;
  status: "healthy" | "warning" | "critical";
}

const EXAMPLE_ASSETS: AssetExample[] = [
  { id: "1", name: "BTC Wallet", icon: <Wallet className="w-4 h-4" />, stage: "growth", value: 150000, status: "healthy" },
  { id: "2", name: "ETH DeFi", icon: <Database className="w-4 h-4" />, stage: "monitoring", value: 75000, status: "warning" },
  { id: "3", name: "Exchange", icon: <Landmark className="w-4 h-4" />, stage: "custody", value: 50000, status: "healthy" },
];

export function AssetLifecycle() {
  const [activeStage, setActiveStage] = useState<string>("custody");
  const [showAnimation, setShowAnimation] = useState(false);

  const currentStage = LIFECYCLE_STAGES.find((s) => s.id === activeStage)!;

  const runLifecycleAnimation = () => {
    setShowAnimation(true);
    let stageIndex = 0;
    const interval = setInterval(() => {
      stageIndex++;
      if (stageIndex >= LIFECYCLE_STAGES.length) {
        clearInterval(interval);
        setShowAnimation(false);
        setActiveStage("custody");
      } else {
        setActiveStage(LIFECYCLE_STAGES[stageIndex].id);
      }
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Lifecycle model:</div>
        <div className="text-blue-600 dark:text-blue-400">
          L = [Acquisition → Custody → Growth → Monitoring → Transition → Execution]
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          DAIO as a governance layer across the entire asset lifecycle
        </div>
      </div>

      {/* Lifecycle Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base">DAIO lifecycle layer</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runLifecycleAnimation}
              disabled={showAnimation}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Simulate cycle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 rounded" />

            {/* Stages */}
            <div className="flex justify-between relative">
              {LIFECYCLE_STAGES.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => !showAnimation && setActiveStage(stage.id)}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all z-10 ${
                      stage.id === activeStage
                        ? `${stage.color} text-white ring-4 ring-offset-2 ring-${stage.color}`
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium ${
                        stage.id === activeStage ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-slate-400 max-w-[80px]">
                      {stage.description}
                    </div>
                  </div>
                  {index < LIFECYCLE_STAGES.length - 1 && (
                    <ArrowRight className="absolute w-4 h-4 text-slate-300"
                      style={{ left: `${(index + 0.5) * (100 / 6) + 8}%`, top: "24px" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Stage Details */}
        <Card className={`border-l-4 ${currentStage.color.replace("bg-", "border-")}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${currentStage.color} text-white flex items-center justify-center`}>
                {currentStage.icon}
              </div>
              <div>
                <CardTitle className="text-base">{currentStage.name}</CardTitle>
                <p className="text-sm text-slate-500">{currentStage.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">
                DAIO role in this phase
              </div>
              <p className="text-sm text-blue-700">{currentStage.daioRole}</p>
            </div>

            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Activities
              </div>
              <ul className="space-y-2">
                {currentStage.activities.map((activity, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Example Assets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Example assets in lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EXAMPLE_ASSETS.map((asset) => (
                <div
                  key={asset.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    asset.stage === activeStage
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-slate-500">
                        Phase: {LIFECYCLE_STAGES.find((s) => s.id === asset.stage)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      ${(asset.value / 1000).toFixed(0)}k
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(asset.status)} text-white text-[10px]`}
                    >
                      {asset.status === "healthy" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {asset.status === "warning" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Lifecycle Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Lifecycle overview</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-500">Assets registered:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-500">Total value:</span>
                  <span className="font-medium">$1.2M</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-500">Executor assigned:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-500">Last review:</span>
                  <span className="font-medium">14 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DAIO Value Proposition */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">DAIO as governance layer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Continuous protection</span>
              </div>
              <p className="text-xs text-slate-500">
                DAIO monitors and protects assets throughout their entire lifecycle,
                not only at succession.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Automated documentation</span>
              </div>
              <p className="text-xs text-slate-500">
                Every change is automatically logged and prepared for succession.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Seamless transfer</span>
              </div>
              <p className="text-xs text-slate-500">
                When the time comes, everything is prepared — no panic,
                no lost assets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
