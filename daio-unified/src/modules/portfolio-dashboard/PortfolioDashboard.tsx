// DAIO Platform - Main Application
// Contains 5 integrated apps:
// 1. Inheritance Incident Simulator
// 2. Governance Map Builder
// 3. No-Custody Compliance Navigator
// 4. Legacy Proof Lab
// 5. Portfolio Continuity Dashboard

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Play,
  GitGraph,
  ShieldCheck,
  FlaskConical,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

// Import Apps
import { IncidentSimulator } from "./apps/simulator/IncidentSimulator";
import { GovernanceMapBuilder } from "./apps/map-builder/GovernanceMapBuilder";
import { ComplianceNavigator } from "./apps/compliance/ComplianceNavigator";
import { LegacyProofLab } from "./apps/proof-lab/LegacyProofLab";
import { ContinuityDashboard } from "./apps/dashboard/ContinuityDashboard";

type AppId = "simulator" | "map-builder" | "compliance" | "proof-lab" | "dashboard";

interface AppConfig {
  id: AppId;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  color: string;
}

const APPS: AppConfig[] = [
  {
    id: "simulator",
    name: "Inheritance Incident Simulator",
    shortName: "Incident Simulator",
    description: "Simulate inheritance scenarios and see where governance breaks",
    icon: <Play className="w-5 h-5" />,
    component: IncidentSimulator,
    color: "bg-amber-500",
  },
  {
    id: "map-builder",
    name: "Governance Map Builder",
    shortName: "Map Builder",
    description: "Visually build and analyze governance structures",
    icon: <GitGraph className="w-5 h-5" />,
    component: GovernanceMapBuilder,
    color: "bg-blue-500",
  },
  {
    id: "compliance",
    name: "No-Custody Compliance Navigator",
    shortName: "Compliance Navigator",
    description: "Understand compliance and liability positioning",
    icon: <ShieldCheck className="w-5 h-5" />,
    component: ComplianceNavigator,
    color: "bg-emerald-500",
  },
  {
    id: "proof-lab",
    name: "Legacy Proof Lab",
    shortName: "Proof Lab",
    description: "Demonstrate proof-of-process with hash chains",
    icon: <FlaskConical className="w-5 h-5" />,
    component: LegacyProofLab,
    color: "bg-purple-500",
  },
  {
    id: "dashboard",
    name: "Portfolio Continuity Dashboard",
    shortName: "Continuity Dashboard",
    description: "Measure and improve portfolio continuity",
    icon: <LayoutDashboard className="w-5 h-5" />,
    component: ContinuityDashboard,
    color: "bg-cyan-500",
  },
];

function App() {
  const [currentApp, setCurrentApp] = useState<AppId>("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  const currentAppConfig = APPS.find((a) => a.id === currentApp)!;
  const CurrentComponent = currentAppConfig.component;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Mobile Nav */}
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                      </div>
                      DAIO Platform
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {APPS.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          setCurrentApp(app.id);
                          setNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          currentApp === app.id
                            ? "bg-slate-100 dark:bg-slate-800"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 ${app.color} rounded-lg flex items-center justify-center text-white`}
                        >
                          {app.icon}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{app.shortName}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {app.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">Continuity Dashboard</h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setCurrentApp(app.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentApp === app.id
                      ? "bg-slate-100 dark:bg-slate-800 font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 ${app.color} rounded-md flex items-center justify-center text-white`}
                  >
                    {app.icon}
                  </div>
                  <span className="hidden xl:inline">{app.shortName}</span>
                </button>
              ))}
            </nav>

            {/* Current App Badge */}
            <Badge
              className={`${currentAppConfig.color} text-white hidden sm:flex items-center gap-1`}
            >
              {currentAppConfig.icon}
              <span className="hidden md:inline">{currentAppConfig.shortName}</span>
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* App Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>Apps</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-900 dark:text-white">
                  {currentAppConfig.name}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {currentAppConfig.description}
              </p>
            </div>

            {/* App Component */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <CurrentComponent />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                DAIO Platform - Digital Asset Inheritance Orchestration
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Strict No-Custody Policy</span>
                <span>•</span>
                <span>Client-Side Only</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default App;
