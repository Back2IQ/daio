import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Coins,
  Bitcoin,
  Database,
  Landmark,
  Lock,
  Unlock,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface AssetType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  characteristics: {
    physical: boolean;
    digital: boolean;
    decentralized: boolean;
    recoverable: boolean;
    timeLocked: boolean;
  };
  accessMethods: string[];
  recoveryDifficulty: "easy" | "medium" | "hard" | "impossible";
  daioBenefit: string;
}

const ASSET_TYPES: AssetType[] = [
  {
    id: "gold",
    name: "Physisches Gold",
    icon: <Coins className="w-5 h-5" />,
    color: "bg-yellow-500",
    characteristics: {
      physical: true,
      digital: false,
      decentralized: true,
      recoverable: true,
      timeLocked: false,
    },
    accessMethods: ["Physischer Zugang", "Tresor-Schlüssel", "Lagerbeleg"],
    recoveryDifficulty: "medium",
    daioBenefit: "Digitale Nachweiskette + physische Lokalisierung",
  },
  {
    id: "btc",
    name: "Bitcoin (Self-Custody)",
    icon: <Bitcoin className="w-5 h-5" />,
    color: "bg-orange-500",
    characteristics: {
      physical: false,
      digital: true,
      decentralized: true,
      recoverable: false,
      timeLocked: false,
    },
    accessMethods: ["Private Key", "Seed Phrase", "Hardware Wallet"],
    recoveryDifficulty: "impossible",
    daioBenefit: "Sichere Key-Vererbung ohne Exposure",
  },
  {
    id: "defi",
    name: "DeFi Positionen",
    icon: <Database className="w-5 h-5" />,
    color: "bg-blue-500",
    characteristics: {
      physical: false,
      digital: true,
      decentralized: true,
      recoverable: false,
      timeLocked: true,
    },
    accessMethods: ["Wallet Connect", "Smart Contract", "Protocol-Keys"],
    recoveryDifficulty: "hard",
    daioBenefit: "Automatisierte Positions-Übertragung",
  },
  {
    id: "exchange",
    name: "Exchange-Konten",
    icon: <Landmark className="w-5 h-5" />,
    color: "bg-green-500",
    characteristics: {
      physical: false,
      digital: true,
      decentralized: false,
      recoverable: true,
      timeLocked: false,
    },
    accessMethods: ["Login + 2FA", "KYC-Daten", "Support-Kontakt"],
    recoveryDifficulty: "medium",
    daioBenefit: "Dokumentierte Zugänge + Executor-Vollmacht",
  },
];

interface ComparisonMetric {
  id: string;
  name: string;
  description: string;
}

const METRICS: ComparisonMetric[] = [
  { id: "physical", name: "Physisch", description: "Greifbares Asset" },
  { id: "digital", name: "Digital", description: "Digitale Existenz" },
  { id: "decentralized", name: "Dezentral", description: "Keine zentrale Kontrolle" },
  { id: "recoverable", name: "Wiederherstellbar", description: "Ohne Original-Zugang" },
  { id: "timeLocked", name: "Zeit-gesperrt", description: "Zeitschloss möglich" },
];

export function AccessContinuityMap() {
  const [selectedAsset, setSelectedAsset] = useState<string>("btc");

  const asset = ASSET_TYPES.find((a) => a.id === selectedAsset)!;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "hard":
        return "bg-orange-500";
      case "impossible":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Einfach";
      case "medium":
        return "Mittel";
      case "hard":
        return "Schwer";
      case "impossible":
        return "Unmöglich";
      default:
        return "Unbekannt";
    }
  };

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Kontinuitäts-Formel:</div>
        <div className="text-blue-600 dark:text-blue-400">
          C = f(Access_Methods, Recovery_Time, Decentralization_Level)
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Vergleicht Mechanik-Unterschiede zwischen Asset-Klassen
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base">Asset-Typ wählen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ASSET_TYPES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAsset(a.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      selectedAsset === a.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.color} text-white`}
                    >
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{a.name}</div>
                    </div>
                    {selectedAsset === a.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Asset Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.color} text-white`}>
                  {asset.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{asset.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`${getDifficultyColor(asset.recoveryDifficulty)} text-white`}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Recovery: {getDifficultyLabel(asset.recoveryDifficulty)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Characteristics */}
              <div>
                <div className="text-sm font-medium mb-2">Eigenschaften</div>
                <div className="grid grid-cols-2 gap-2">
                  {METRICS.map((metric) => (
                    <div
                      key={metric.id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        asset.characteristics[metric.id as keyof typeof asset.characteristics]
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {asset.characteristics[metric.id as keyof typeof asset.characteristics] ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                      )}
                      <span className="text-xs">{metric.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Methods */}
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Zugangsmethoden
                </div>
                <div className="space-y-1">
                  {asset.accessMethods.map((method, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {/* DAIO Benefit */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  DAIO-Vorteil
                </div>
                <p className="text-sm text-blue-700">{asset.daioBenefit}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Asset-Vergleichsmatrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Asset</th>
                      <th className="text-center py-2 px-2">
                        <Lock className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center py-2 px-2">
                        <Unlock className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center py-2 px-2">
                        <Users className="w-4 h-4 mx-auto" />
                      </th>
                      <th className="text-center py-2 px-2">
                        <Clock className="w-4 h-4 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ASSET_TYPES.map((a) => (
                      <tr
                        key={a.id}
                        className={`border-b last:border-0 ${
                          a.id === selectedAsset ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-2 px-2 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${a.color} text-white`}>
                            {a.icon}
                          </div>
                          <span className="text-xs">{a.name.split(" ")[0]}</span>
                        </td>
                        <td className="text-center py-2 px-2">
                          {a.characteristics.decentralized ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="text-center py-2 px-2">
                          {!a.characteristics.recoverable ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2 px-2">
                          {a.characteristics.decentralized ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="text-center py-2 px-2">
                          {a.characteristics.timeLocked ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Dezentral</span>
                </div>
                <div className="flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>Recoverable</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Multi-User</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Time-Lock</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
