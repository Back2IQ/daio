// DAIO Strategic Platform
// 10 web apps: 5 for needs identification + 5 for mechanism explanation

import { useState } from "react";
// Button import removed - not used
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingDown,
  Scan,
  UserX,
  TestTube,
  DollarSign,
  GitBranch,
  Shield,
  Map,
  RotateCcw,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// Part 1: Need Apps
import { LossSimulator } from "./apps/need/LossSimulator";
import { InvisibleWealthScanner } from "./apps/need/InvisibleWealthScanner";
import { KeyPersonRisk } from "./apps/need/KeyPersonRisk";
import { StressTestTool } from "./apps/need/StressTestTool";
import { LostCounter } from "./apps/need/LostCounter";

// Part 2: Mechanism Apps
import { GovernanceFlow } from "./apps/mechanism/GovernanceFlow";
import { NoCustodyArch } from "./apps/mechanism/NoCustodyArch";
import { AccessContinuityMap } from "./apps/mechanism/AccessContinuityMap";
import { AssetLifecycle } from "./apps/mechanism/AssetLifecycle";
import { ContinuityIndex } from "./apps/mechanism/ContinuityIndex";

type AppId =
  | "loss-simulator"
  | "wealth-scanner"
  | "key-person"
  | "stress-test"
  | "lost-counter"
  | "governance-flow"
  | "no-custody"
  | "continuity-map"
  | "lifecycle"
  | "continuity-index";

interface AppConfig {
  id: AppId;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  section: "need" | "mechanism";
}

const APPS: AppConfig[] = [
  // Part 1: Need Apps
  {
    id: "loss-simulator",
    name: "Digital Asset Loss Simulator",
    description: "Shows what happens when an owner becomes unavailable",
    icon: <TrendingDown className="w-5 h-5" />,
    component: LossSimulator,
    section: "need",
  },
  {
    id: "wealth-scanner",
    name: "Invisible Wealth Scanner",
    description: "Makes invisible digital assets visible",
    icon: <Scan className="w-5 h-5" />,
    component: InvisibleWealthScanner,
    section: "need",
  },
  {
    id: "key-person",
    name: "Key Person Risk Visualizer",
    description: "Business shutdown heatmap for entrepreneurs",
    icon: <UserX className="w-5 h-5" />,
    component: KeyPersonRisk,
    section: "need",
  },
  {
    id: "stress-test",
    name: "Digital Estate Stress-Test",
    description: "Which assets are blocked by which events",
    icon: <TestTube className="w-5 h-5" />,
    component: StressTestTool,
    section: "need",
  },
  {
    id: "lost-counter",
    name: "The $ Lost Counter",
    description: "Real-time visualization of global losses",
    icon: <DollarSign className="w-5 h-5" />,
    component: LostCounter,
    section: "need",
  },
  // Part 2: Mechanism Apps
  {
    id: "governance-flow",
    name: "Governance Flow Explorer",
    description: "Asset → Trigger → Executor → Quorum → Release",
    icon: <GitBranch className="w-5 h-5" />,
    component: GovernanceFlow,
    section: "mechanism",
  },
  {
    id: "no-custody",
    name: "No-Custody Architecture",
    description: "What DAIO does NOT do vs. what it does",
    icon: <Shield className="w-5 h-5" />,
    component: NoCustodyArch,
    section: "mechanism",
  },
  {
    id: "continuity-map",
    name: "Access Continuity Map",
    description: "Comparison: Gold, BTC, DeFi — mechanism differences",
    icon: <Map className="w-5 h-5" />,
    component: AccessContinuityMap,
    section: "mechanism",
  },
  {
    id: "lifecycle",
    name: "Asset Lifecycle Diagram",
    description: "DAIO as a layer across the entire lifecycle",
    icon: <RotateCcw className="w-5 h-5" />,
    component: AssetLifecycle,
    section: "mechanism",
  },
  {
    id: "continuity-index",
    name: "Continuity Index Builder",
    description: "Build your governance structure and see the score",
    icon: <BarChart3 className="w-5 h-5" />,
    component: ContinuityIndex,
    section: "mechanism",
  },
];

function App() {
  const [currentApp, setCurrentApp] = useState<AppId>("loss-simulator");
  const [activeSection, setActiveSection] = useState<"need" | "mechanism">("need");

  const currentAppConfig = APPS.find((a) => a.id === currentApp)!;
  const CurrentComponent = currentAppConfig.component;

  const needApps = APPS.filter((a) => a.section === "need");
  const mechanismApps = APPS.filter((a) => a.section === "mechanism");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Back2IQ" className="h-9 w-auto" />
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white text-lg">
                    Back2IQ
                  </h1>
                  <p className="text-xs text-slate-500 -mt-1">
                    Ahead by Design
                  </p>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">
                  Strategic Platform
                </h1>
                <p className="text-xs text-slate-500">
                  10 instruments for digital asset succession
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              {currentAppConfig.name}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs
          value={activeSection}
          onValueChange={(v) => {
            setActiveSection(v as "need" | "mechanism");
            setCurrentApp(v === "need" ? "loss-simulator" : "governance-flow");
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="need" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Part 1: Identify the Need
            </TabsTrigger>
            <TabsTrigger value="mechanism" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Part 2: Understand the Mechanisms
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {activeSection === "need"
                      ? "Create Problem Clarity"
                      : "Explain the Architecture"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(activeSection === "need" ? needApps : mechanismApps).map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setCurrentApp(app.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        currentApp === app.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          currentApp === app.id
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{app.name}</div>
                      </div>
                      {currentApp === app.id && (
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-slate-100 dark:bg-slate-800/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {activeSection === "need"
                      ? "These apps create problem clarity, not product sales. They show where digital assets are at risk."
                      : "These apps explain the DAIO architecture from different perspectives. They make the system understandable."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main App Area */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                      {currentAppConfig.icon}
                    </div>
                    <div>
                      <CardTitle>{currentAppConfig.name}</CardTitle>
                      <CardDescription>{currentAppConfig.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CurrentComponent />
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>DAIO Strategic Platform • No hype. Just strategy.</div>
            <div>Strict No-Custody • Client-Side Only</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
