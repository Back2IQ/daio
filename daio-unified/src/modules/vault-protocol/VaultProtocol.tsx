// DAIO Vault Protocol — Main Module Component
// Shamir-based threshold container system with 5 integrated apps

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
  KeyRound,
  Unlock,
  ShieldCheck,
  Bug,
  ChevronRight,
} from "lucide-react";

import { VaultDemo } from "./apps/demo/VaultDemo";
import { VaultCreator } from "./apps/creator/VaultCreator";
import { VaultReconstructor } from "./apps/reconstructor/VaultReconstructor";
import { ShardVerifier } from "./apps/verifier/ShardVerifier";
import { HoneypotManager } from "./apps/honeypot/HoneypotManager";

type AppId = "demo" | "creator" | "reconstructor" | "verifier" | "honeypot";

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
    id: "demo",
    name: "Interactive Protocol Demo",
    shortName: "Protocol Demo",
    description:
      "Interaktive Demonstration des gesamten Shamir Vault Protokolls",
    icon: <Play className="w-5 h-5" />,
    component: VaultDemo,
    color: "bg-indigo-500",
  },
  {
    id: "creator",
    name: "Vault Creator",
    shortName: "Vault Creator",
    description:
      "Vault erstellen: Secret splitten, Shards generieren, Honeypots konfigurieren",
    icon: <KeyRound className="w-5 h-5" />,
    component: VaultCreator,
    color: "bg-blue-500",
  },
  {
    id: "reconstructor",
    name: "Vault Reconstructor",
    shortName: "Reconstructor",
    description:
      "Secret aus Shards rekonstruieren mit sicherer Canvas-Anzeige",
    icon: <Unlock className="w-5 h-5" />,
    component: VaultReconstructor,
    color: "bg-green-500",
  },
  {
    id: "verifier",
    name: "Shard Verifier",
    shortName: "Shard Verifier",
    description:
      "Einzelne Shards gegen Feldman VSS Commitments verifizieren",
    icon: <ShieldCheck className="w-5 h-5" />,
    component: ShardVerifier,
    color: "bg-emerald-500",
  },
  {
    id: "honeypot",
    name: "Honeypot Manager",
    shortName: "Honeypot Manager",
    description:
      "Decoy-Container erstellen, Canary-Shards verwalten, Alerts überwachen",
    icon: <Bug className="w-5 h-5" />,
    component: HoneypotManager,
    color: "bg-amber-500",
  },
];

function App() {
  const [currentApp, setCurrentApp] = useState<AppId>("demo");
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
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">V</span>
                    </div>
                    DAIO Vault Protocol
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
                        <div className="font-medium text-sm">
                          {app.shortName}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {app.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 dark:text-white">
                  DAIO Vault Protocol
                </h1>
                <p className="text-xs text-slate-500">
                  Shamir's Secret Sharing — Zero Knowledge by Design
                </p>
              </div>
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
            <span className="hidden md:inline">
              {currentAppConfig.shortName}
            </span>
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>Vault Protocol</span>
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
              DAIO Vault Protocol — Shamir's Secret Sharing (T-von-N)
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Zero Knowledge by Design</span>
              <span>•</span>
              <span>Offline-fähig</span>
              <span>•</span>
              <span>Post-Quantum sicher</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
