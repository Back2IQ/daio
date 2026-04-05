import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Scan,
  Bitcoin,
  Wallet,
  Building2,
  Globe,
  Gamepad2,
  Users,
  Cloud,
  Landmark,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatCurrency } from "../../utils/calculations";

interface WealthItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  typicalValue: number;
  commonlyMissed: boolean;
  category: string;
}

const WEALTH_ITEMS: WealthItem[] = [
  {
    id: "crypto",
    name: "Cryptocurrency Wallets",
    icon: <Bitcoin className="w-5 h-5" />,
    typicalValue: 150000,
    commonlyMissed: true,
    category: "Financial",
  },
  {
    id: "defi",
    name: "DeFi Positionen & Yield",
    icon: <Wallet className="w-5 h-5" />,
    typicalValue: 75000,
    commonlyMissed: true,
    category: "Financial",
  },
  {
    id: "exchange",
    name: "Exchange-Konten",
    icon: <Landmark className="w-5 h-5" />,
    typicalValue: 50000,
    commonlyMissed: true,
    category: "Financial",
  },
  {
    id: "business",
    name: "Geschäftskonten & SaaS",
    icon: <Building2 className="w-5 h-5" />,
    typicalValue: 25000,
    commonlyMissed: true,
    category: "Business",
  },
  {
    id: "domain",
    name: "Domains & DNS-Verwaltung",
    icon: <Globe className="w-5 h-5" />,
    typicalValue: 10000,
    commonlyMissed: true,
    category: "Digital",
  },
  {
    id: "gaming",
    name: "Gaming-Assets & NFTs",
    icon: <Gamepad2 className="w-5 h-5" />,
    typicalValue: 15000,
    commonlyMissed: true,
    category: "Digital",
  },
  {
    id: "social",
    name: "Social Media & Follower",
    icon: <Users className="w-5 h-5" />,
    typicalValue: 5000,
    commonlyMissed: true,
    category: "Digital",
  },
  {
    id: "cloud",
    name: "Cloud-Speicher & Daten",
    icon: <Cloud className="w-5 h-5" />,
    typicalValue: 3000,
    commonlyMissed: true,
    category: "Digital",
  },
];

export function InvisibleWealthScanner() {
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [documentedItems, setDocumentedItems] = useState<Set<string>>(new Set());

  const toggleOwned = (id: string) => {
    const newOwned = new Set(ownedItems);
    if (newOwned.has(id)) {
      newOwned.delete(id);
      // Also remove from documented if no longer owned
      const newDocumented = new Set(documentedItems);
      newDocumented.delete(id);
      setDocumentedItems(newDocumented);
    } else {
      newOwned.add(id);
    }
    setOwnedItems(newOwned);
  };

  const toggleDocumented = (id: string) => {
    const newDocumented = new Set(documentedItems);
    if (newDocumented.has(id)) {
      newDocumented.delete(id);
    } else {
      newDocumented.add(id);
    }
    setDocumentedItems(newDocumented);
  };

  const totalOwnedValue = WEALTH_ITEMS.filter((item) =>
    ownedItems.has(item.id)
  ).reduce((sum, item) => sum + item.typicalValue, 0);

  const totalDocumentedValue = WEALTH_ITEMS.filter((item) =>
    documentedItems.has(item.id)
  ).reduce((sum, item) => sum + item.typicalValue, 0);

  const undocumentedValue = totalOwnedValue - totalDocumentedValue;
  const documentationRate =
    totalOwnedValue > 0 ? (totalDocumentedValue / totalOwnedValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Sichtbarkeits-Index:</div>
        <div className="text-blue-600 dark:text-blue-400">
          SI = (Dokumentierter Wert / Gesamtwert) × 100
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Ziel: SI ≥ 95% für digitale Vermögensnachfolge
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scanner Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base">
                  Digitale Vermögens-Scanner
                </CardTitle>
              </div>
              <p className="text-sm text-slate-500">
                Markieren Sie alle Assets, die Sie besitzen
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WEALTH_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      ownedItems.has(item.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          ownedItems.has(item.id)
                            ? "bg-blue-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          Typischer Wert: {formatCurrency(item.typicalValue)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.commonlyMissed && (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Häufig übersehen
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`own-${item.id}`}
                          checked={ownedItems.has(item.id)}
                          onCheckedChange={() => toggleOwned(item.id)}
                        />
                        <Label htmlFor={`own-${item.id}`} className="text-sm cursor-pointer">
                          Besitze ich
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documentation Check */}
          {ownedItems.size > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dokumentations-Status</CardTitle>
                <p className="text-sm text-slate-500">
                  Welche Assets sind für Erben dokumentiert?
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {WEALTH_ITEMS.filter((item) => ownedItems.has(item.id)).map(
                    (item) => (
                      <div
                        key={`doc-${item.id}`}
                        className="flex items-center justify-between p-2 rounded bg-slate-50"
                      >
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`doc-${item.id}`}
                            checked={documentedItems.has(item.id)}
                            onCheckedChange={() => toggleDocumented(item.id)}
                          />
                          <Label
                            htmlFor={`doc-${item.id}`}
                            className="text-sm cursor-pointer"
                          >
                            Dokumentiert
                          </Label>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-sm opacity-80">Sichtbarer Wert</div>
              <div className="text-3xl font-bold">
                {formatCurrency(totalDocumentedValue)}
              </div>
              <div className="text-sm opacity-80 mt-1">
                von {formatCurrency(totalOwnedValue)} gesamt
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6 text-center">
              <EyeOff className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-sm opacity-80">Unsichtbarer Wert</div>
              <div className="text-3xl font-bold">
                {formatCurrency(undocumentedValue)}
              </div>
              <div className="text-sm opacity-80 mt-1">
                Für Erben nicht auffindbar
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dokumentations-Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {documentationRate.toFixed(0)}%
                </div>
                <div className="text-sm text-slate-500">Ihr Sichtbarkeits-Index</div>
              </div>
              <Progress value={documentationRate} className="h-3" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              {documentationRate < 50 && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Kritischer Zustand: Mehr als 50% unsichtbar
                </div>
              )}
              {documentationRate >= 50 && documentationRate < 80 && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Verbesserungsbedarf: 20%+ nicht dokumentiert
                </div>
              )}
              {documentationRate >= 80 && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Gut: Mehr als 80% dokumentiert
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Risiko-Analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Gefährdete Assets:</span>
                <span className="font-mono font-medium">{ownedItems.size - documentedItems.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Risiko-Wert:</span>
                <span className="font-mono font-medium">
                  {formatCurrency(undocumentedValue)}
                </span>
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t">
                Bei Ausfall ohne DAIO: {formatCurrency(undocumentedValue * 0.7)} 
                bis {formatCurrency(undocumentedValue)} potenziell verloren
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
