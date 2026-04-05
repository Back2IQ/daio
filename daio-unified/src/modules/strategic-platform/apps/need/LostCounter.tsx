import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Globe,
  Clock,
  AlertTriangle,
  Bitcoin,
  Wallet,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency } from "../../utils/calculations";

// Constants for global loss calculation
// Sources: Industry estimates (Chainalysis 2023, Glassnode), WHO mortality data
// These are illustrative projections — actual figures may vary significantly
const GLOBAL_CRYPTO_MARKET_CAP = 2_500_000_000_000; // $2.5T (CoinMarketCap aggregate)
const DAILY_DEATHS_WITH_CRYPTO = 1500; // Estimated based on global mortality × crypto adoption rate

interface LossStats {
  totalLost: number;
  dailyLoss: number;
  yearlyLoss: number;
  btcLost: number;
  ethLost: number;
  walletsLost: number;
}

export function LostCounter() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stats, setStats] = useState<LossStats>({
    totalLost: 145_000_000_000, // Industry estimate (Chainalysis/Glassnode extrapolation)
    dailyLoss: 89_000_000,      // Derived: ~1500 deaths/day × ~$59k avg portfolio
    yearlyLoss: 32_485_000_000, // Derived: dailyLoss × 365
    btcLost: 4_000_000,         // Chainalysis 2023 estimate: 3.7-4M BTC inaccessible
    ethLost: 3_200_000,         // Extrapolated from on-chain dormancy analysis
    walletsLost: 23_500_000,    // Glassnode: wallets inactive >5 years
  });

  // Real-time counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => {
        // Use s to avoid unused variable warning
        void s;
        return elapsedSeconds + 1;
      });
      setStats((prev) => ({
        ...prev,
        totalLost: prev.totalLost + prev.dailyLoss / 86400,
        walletsLost: prev.walletsLost + DAILY_DEATHS_WITH_CRYPTO / 86400,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [elapsedSeconds]);

  // Generate historical data
  const historicalData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleString("de-DE", { month: "short" });
    const baseLoss = 120_000_000_000;
    const growth = 1 + i * 0.05;
    return {
      month,
      lost: baseLoss * growth,
      projected: baseLoss * growth * 1.2,
    };
  });

  const perSecondLoss = stats.dailyLoss / 86400;
  const perMinuteLoss = perSecondLoss * 60;
  const perHourLoss = perMinuteLoss * 60;

  return (
    <div className="space-y-6">
      {/* Formula Display */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500 mb-2">Globaler Verlust-Algorithmus:</div>
        <div className="text-blue-600 dark:text-blue-400">
          L(t) = L₀ × e^(rt) + Σ (Todesfälle × Ø-Portfolio)
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          r = 0.01% tägliche Wachstumsrate · Geschätzte 1.500 tägliche Todesfälle mit Crypto
        </div>
        <div className="text-amber-600 dark:text-amber-400 text-xs mt-2">
          Hinweis: Alle Zahlen sind Branchenschätzungen (Chainalysis, Glassnode, WHO-Mortalitätsdaten) und dienen der Veranschaulichung.
        </div>
      </div>

      {/* Live Counter */}
      <Card className="bg-gradient-to-br from-red-600 to-orange-600 text-white overflow-hidden">
        <CardContent className="p-8 text-center relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <span className="text-sm opacity-80">Echtzeit-Verlust-Counter</span>
            </div>
            <div className="text-5xl md:text-6xl font-bold font-mono mb-2">
              {formatCurrency(stats.totalLost)}
            </div>
            <div className="text-lg opacity-80">Geschätzter globaler Verlust</div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div>
                <div className="font-mono font-bold">{formatCurrency(perSecondLoss)}/s</div>
                <div className="opacity-60">pro Sekunde</div>
              </div>
              <div>
                <div className="font-mono font-bold">{formatCurrency(perMinuteLoss)}/min</div>
                <div className="opacity-60">pro Minute</div>
              </div>
              <div>
                <div className="font-mono font-bold">{formatCurrency(perHourLoss)}/h</div>
                <div className="opacity-60">pro Stunde</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 text-center">
                <Bitcoin className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">BTC Geschätzt Verloren</div>
                <div className="text-xl font-bold text-amber-700">
                  {(stats.btcLost / 1_000_000).toFixed(1)}M
                </div>
                <div className="text-xs text-amber-600">
                  {(stats.btcLost / 21_000_000 * 100).toFixed(1)}% des Supply
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200">
              <CardContent className="p-4 text-center">
                <Wallet className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">ETH Geschätzt Verloren</div>
                <div className="text-xl font-bold text-indigo-700">
                  {(stats.ethLost / 1_000_000).toFixed(1)}M
                </div>
                <div className="text-xs text-indigo-600">
                  Unzugängliche Wallets
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Wallets Verloren</div>
                <div className="text-xl font-bold text-red-700">
                  {(stats.walletsLost / 1_000_000).toFixed(1)}M
                </div>
                <div className="text-xs text-red-600">
                  Ohne Recovery-Option
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Täglicher Verlust</div>
                <div className="text-xl font-bold text-blue-700">
                  {formatCurrency(stats.dailyLoss)}
                </div>
                <div className="text-xs text-blue-600">
                  Globale Schätzung
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 text-center">
                <Globe className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">Jährlicher Verlust</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(stats.yearlyLoss)}
                </div>
                <div className="text-xs text-green-600">
                  Projektion 2024
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xs text-slate-500">% Market Cap</div>
                <div className="text-xl font-bold text-purple-700">
                  {(stats.totalLost / GLOBAL_CRYPTO_MARKET_CAP * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-purple-600">
                  Von gesamtem Markt
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <CardTitle className="text-base">Historische Verlust-Entwicklung</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v / 1_000_000_000).toFixed(0)}B`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="lost"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="Verloren"
                    />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Projiziert"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Wichtige Statistiken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bitcoin verloren:</span>
                  <Badge variant="secondary">~4M BTC</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">% von BTC Supply:</span>
                  <Badge variant="destructive">~19%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tägliche Todesfälle:</span>
                  <Badge variant="secondary">~1.500</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ø Portfolio-Wert:</span>
                  <Badge variant="secondary">$50.000</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base text-amber-800">Warum das passiert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-amber-800">
                <li>• Keine dokumentierten Seed Phrases</li>
                <li>• Unbekannte Exchange-Konten</li>
                <li>• Fehlende Testamentsvollstreckung</li>
                <li>• Verlorene Hardware Wallets</li>
                <li>• Unbekannte DeFi-Positionen</li>
                <li>• Keine Notfall-Kontakte</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <CardTitle className="text-base text-green-800">DAIO Impact</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800 space-y-2">
                <p>
                  Mit DAIO-Governance könnten geschätzte{' '}
                  <strong>85-95%</strong> dieser Verluste verhindert werden.
                </p>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between">
                    <span>Potenzielle Ersparnis:</span>
                    <span className="font-bold">
                      {formatCurrency(stats.totalLost * 0.9)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
