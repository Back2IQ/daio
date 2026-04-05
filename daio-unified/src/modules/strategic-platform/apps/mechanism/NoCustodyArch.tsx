import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check, Shield, Eye, EyeOff, Lock, Unlock, Database } from "lucide-react";

interface ComparisonItem {
  aspect: string;
  traditional: string;
  daio: string;
  traditionalIcon: "x" | "check" | "warning";
  daioIcon: "x" | "check" | "warning";
}

const COMPARISONS: ComparisonItem[] = [
  {
    aspect: "Key Storage",
    traditional: "Custodial: Keys beim Anbieter",
    daio: "Non-Custodial: Keys beim Nutzer",
    traditionalIcon: "warning",
    daioIcon: "check",
  },
  {
    aspect: "Asset Zugriff",
    traditional: "Anbieter kann Assets einfrieren",
    daio: "Nur Nutzer hat Zugriff",
    traditionalIcon: "warning",
    daioIcon: "check",
  },
  {
    aspect: "Nachfolge",
    traditional: "Komplexe rechtliche Prozesse",
    daio: "Automatisierte Smart Contracts",
    traditionalIcon: "x",
    daioIcon: "check",
  },
  {
    aspect: "Transparenz",
    traditional: "Innere Abläufe undurchsichtig",
    daio: "Vollständig auditable",
    traditionalIcon: "x",
    daioIcon: "check",
  },
  {
    aspect: "Single Point of Failure",
    traditional: "Anbieter-Insolvenz = Verlust",
    daio: "Dezentral, kein SPOF",
    traditionalIcon: "warning",
    daioIcon: "check",
  },
  {
    aspect: "Kosten",
    traditional: "Hohe Verwahrgebühren",
    daio: "Nur Transaktionsgebühren",
    traditionalIcon: "warning",
    daioIcon: "check",
  },
];

interface DaioLayer {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const DAIO_LAYERS: DaioLayer[] = [
  {
    id: "identity",
    name: "Identity Layer",
    description: "Verifizierte Identitäten ohne Zentralisierung",
    icon: <Eye className="w-5 h-5" />,
    features: [
      "DID (Decentralized Identity)",
      "Verifiable Credentials",
      "Zero-Knowledge Proofs",
      "Keine PII-Speicherung",
    ],
  },
  {
    id: "governance",
    name: "Governance Layer",
    description: "Regelbasierte Entscheidungsfindung",
    icon: <Shield className="w-5 h-5" />,
    features: [
      "Smart Contract Policies",
      "Multi-Sig Quorum",
      "Time-Lock Mechanismen",
      "Widerspruchsfristen",
    ],
  },
  {
    id: "execution",
    name: "Execution Layer",
    description: "Sichere Ausführung ohne Key-Exposure",
    icon: <Unlock className="w-5 h-5" />,
    features: [
      "MPC (Multi-Party Computation)",
      "Shamir Secret Sharing",
      "Threshold Signatures",
      "Hardware Security Modules",
    ],
  },
  {
    id: "storage",
    name: "Storage Layer",
    description: "Verschlüsselte, verteilte Datenspeicherung",
    icon: <Database className="w-5 h-5" />,
    features: [
      "End-to-End Verschlüsselung",
      "Distributed Storage",
      "Client-Side Encryption",
      "Zero-Knowledge Architecture",
    ],
  },
];

export function NoCustodyArch() {
  const [activeLayer, setActiveLayer] = useState<string>("governance");

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">No-Custody Prinzip:</div>
        <div className="text-blue-600 dark:text-blue-400">
          DAIO = Governance(Assets) ≠ Custody(Assets)
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          DAIO verwaltet Regeln, nicht Assets. Private Keys bleiben immer beim Eigentümer.
        </div>
      </div>

      {/* Core Message */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Strict No-Custody Architecture</h3>
              <p className="text-white/80 mt-1">
                DAIO speichert niemals private Keys oder Assets. Wir bieten Governance-Infrastruktur, 
                keine Verwahrung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Traditionell vs. DAIO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Aspekt</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      Traditionell (Custodial)
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      DAIO (Non-Custodial)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((item, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{item.aspect}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.traditionalIcon === "x" && (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        {item.traditionalIcon === "warning" && (
                          <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                            !
                          </span>
                        )}
                        {item.traditionalIcon === "check" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm text-slate-600">{item.traditional}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.daioIcon === "x" && (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        {item.daioIcon === "warning" && (
                          <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                            !
                          </span>
                        )}
                        {item.daioIcon === "check" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm text-slate-600">{item.daio}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DAIO Architecture Layers */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">DAIO Architektur-Layer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DAIO_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    activeLayer === layer.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeLayer === layer.id
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {layer.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{layer.name}</div>
                    <div className="text-xs text-slate-500">{layer.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Layer Details */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {DAIO_LAYERS.find((l) => l.id === activeLayer)?.icon}
              <CardTitle className="text-base">
                {DAIO_LAYERS.find((l) => l.id === activeLayer)?.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              {DAIO_LAYERS.find((l) => l.id === activeLayer)?.description}
            </p>
            <div className="space-y-2">
              {DAIO_LAYERS.find((l) => l.id === activeLayer)?.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Principles */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="font-medium text-green-800">Keys bleiben beim Nutzer</div>
            <p className="text-xs text-green-600 mt-2">
              DAIO speichert niemals private Keys oder Seed Phrases
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="font-medium text-blue-800">Governance ohne Custody</div>
            <p className="text-xs text-blue-600 mt-2">
              Regeln werden verwaltet, nicht die Assets selbst
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="font-medium text-purple-800">Vollständig transparent</div>
            <p className="text-xs text-purple-600 mt-2">
              Alle Abläufe sind auditierbar und nachvollziehbar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
