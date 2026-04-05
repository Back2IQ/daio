import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bitcoin,
  TrendingDown,
  TrendingUp,
  Clock,
  Skull,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

// ~3.7 million BTC estimated permanently lost (Chainalysis research)
const LOST_BTC = 3_700_000;
// ~21 million total BTC supply cap
const TOTAL_BTC = 21_000_000;
const LOST_PERCENT = ((LOST_BTC / TOTAL_BTC) * 100).toFixed(1);

// Additional context numbers
const DORMANT_WALLETS = 1_800_000; // estimated wallets with no activity 5+ years
const SATOSHI_BTC = 1_100_000; // Satoshi's untouched coins

interface PriceData {
  eur: number;
  usd: number;
  eur_24h_change: number;
  usd_24h_change: number;
  last_updated: number;
}

function formatLargeNumber(value: number, currency: "EUR" | "USD"): string {
  const symbol = currency === "EUR" ? "\u20AC" : "$";
  if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(3)} T`;
  if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)} Mrd.`;
  if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)} Mio.`;
  return `${symbol}${value.toLocaleString("de-DE")}`;
}

function formatPrice(value: number, currency: "EUR" | "USD"): string {
  const symbol = currency === "EUR" ? "\u20AC" : "$";
  return `${symbol}${value.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function App() {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [flashDir, setFlashDir] = useState<"up" | "down" | null>(null);
  const prevPrice = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur,usd&include_24hr_change=true&include_last_updated_at=true"
      );
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const btc = data.bitcoin;

      const newPrice: PriceData = {
        eur: btc.eur,
        usd: btc.usd,
        eur_24h_change: btc.eur_24h_change ?? 0,
        usd_24h_change: btc.usd_24h_change ?? 0,
        last_updated: btc.last_updated_at * 1000,
      };

      setPrice((prev) => {
        const oldVal = prev ? (currency === "EUR" ? prev.eur : prev.usd) : 0;
        const newVal = currency === "EUR" ? newPrice.eur : newPrice.usd;
        if (oldVal > 0 && newVal !== oldVal) {
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          setFlashDir(newVal > oldVal ? "up" : "down");
          flashTimerRef.current = setTimeout(() => setFlashDir(null), 700);
        }
        prevPrice.current = newVal;
        return newPrice;
      });

      setConnected(true);
      setError(null);
      setLoading(false);
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Connection failed");
      setLoading(false);
    }
  }, [currency]);

  // Initial fetch + 30s interval (CoinGecko free tier rate limit)
  useEffect(() => {
    fetchPrice();
    intervalRef.current = setInterval(fetchPrice, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [fetchPrice]);

  const currentPrice = price
    ? currency === "EUR"
      ? price.eur
      : price.usd
    : 0;
  const change24h = price
    ? currency === "EUR"
      ? price.eur_24h_change
      : price.usd_24h_change
    : 0;

  const totalLostValue = currentPrice * LOST_BTC;
  const satoshiValue = currentPrice * SATOSHI_BTC;
  const lostPerSecond = totalLostValue / (365.25 * 24 * 3600);

  // Running "per second" counter
  const [microOffset, setMicroOffset] = useState(0);
  useEffect(() => {
    if (!price) return;
    const timer = setInterval(() => {
      setMicroOffset((prev) => prev + lostPerSecond * 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [price, lostPerSecond]);

  // Reset micro-offset when price updates
  useEffect(() => {
    setMicroOffset(0);
  }, [price]);

  const displayTotalLoss = totalLostValue + microOffset;

  return (
    <div className="min-h-screen dot-grid flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 50%, #000000 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Back2IQ" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 tracking-wider uppercase">
                Back2IQ — Ahead by Design
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
              <button
                onClick={() => setCurrency("EUR")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currency === "EUR"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EUR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currency === "USD"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                USD
              </button>
            </div>
            {/* Connection status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <button
                onClick={fetchPrice}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-400 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {error && !price && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">
              API nicht erreichbar: {error}. Versuche erneut...
            </p>
          </div>
        )}

        {/* BTC Icon with pulse */}
        <div className="mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center pulse-ring">
            <Bitcoin className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-300 mb-2 animate-slide-up text-center">
          Global Bitcoin Losses — Live Ticker
        </h1>
        <p className="text-slate-500 text-sm mb-12 animate-slide-up text-center max-w-lg">
          {LOST_BTC.toLocaleString("de-DE")} BTC ({LOST_PERCENT}% aller jemals
          geschurften Bitcoins) sind permanent verloren — umgerechnet zum
          aktuellen Kurs:
        </p>

        {/* MAIN TICKER */}
        <div className="relative mb-12">
          <div
            className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black btc-glow ticker-value text-center leading-none ${
              flashDir === "up"
                ? "flash-green"
                : flashDir === "down"
                  ? "flash-red"
                  : "text-orange-400"
            }`}
          >
            {price
              ? formatLargeNumber(displayTotalLoss, currency)
              : "---"}
          </div>
          <p className="text-center text-slate-500 text-sm mt-4">
            Wert der permanent verlorenen Bitcoin
          </p>
        </div>

        {/* Current BTC price bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 animate-slide-up">
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 rounded-xl px-5 py-3">
            <Bitcoin className="w-5 h-5 text-orange-400" />
            <span className="text-slate-400 text-sm">1 BTC =</span>
            <span className="text-white font-bold text-lg">
              {price ? formatPrice(currentPrice, currency) : "---"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 rounded-xl px-5 py-3">
            {change24h >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-slate-400 text-sm">24h</span>
            <span
              className={`font-bold text-lg ${change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 rounded-xl px-5 py-3">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 text-sm">
              {price ? formatTime(price.last_updated) : "--:--:--"}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mb-16">
          <StatCard
            icon={<Skull className="w-5 h-5 text-red-400" />}
            label="Permanent verlorene BTC"
            value={`${LOST_BTC.toLocaleString("de-DE")} BTC`}
            sub={`${LOST_PERCENT}% des Gesamtangebots`}
            borderColor="border-red-500/20"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            label="Dormante Wallets (5+ Jahre)"
            value={`~${(DORMANT_WALLETS / 1e6).toFixed(1)} Mio.`}
            sub="Wallets ohne jede Aktivitat"
            borderColor="border-amber-500/20"
          />
          <StatCard
            icon={<Bitcoin className="w-5 h-5 text-orange-400" />}
            label="Satoshis unangetastete Coins"
            value={`${(SATOSHI_BTC / 1e6).toFixed(1)} Mio. BTC`}
            sub={
              price
                ? `Wert: ${formatLargeNumber(satoshiValue, currency)}`
                : "---"
            }
            borderColor="border-orange-500/20"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5 text-purple-400" />}
            label="Verlust pro Sekunde"
            value={
              price
                ? formatPrice(Math.round(lostPerSecond), currency)
                : "---"
            }
            sub="Basierend auf jahrlichem Wertzuwachs"
            borderColor="border-purple-500/20"
          />
        </div>

        {/* Context section */}
        <div className="w-full max-w-5xl">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Warum gehen Bitcoins verloren?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReasonCard
                percent={38}
                title="Verlorene Private Keys"
                desc="Festplatten entsorgt, Passworter vergessen, Hardware-Wallets zerstort"
                color="bg-red-500"
              />
              <ReasonCard
                percent={35}
                title="Verstorbene Inhaber"
                desc="Keine Nachfolgeplanung, keine Zugangsregelung, keine Governance"
                color="bg-orange-500"
              />
              <ReasonCard
                percent={27}
                title="Fruhe Mining-Coins"
                desc="Satoshis Coins, fruhe Miner die Keys verworfen haben, Genesis-Block"
                color="bg-amber-500"
              />
            </div>
            <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
              <p className="text-sm text-slate-400">
                <span className="text-orange-400 font-semibold">
                  DAIO lost genau dieses Problem:
                </span>{" "}
                Digital Asset Inheritance Orchestration — kryptografische
                Zugangsarchitektur, die sicherstellt, dass digitale
                Vermogenswerte im Todesfall geordnet ubergehen. Keine
                Verwahrung, reine Governance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Scrolling news ticker bar */}
      <div className="border-t border-slate-800/50 bg-slate-950/80 overflow-hidden">
        <div className="flex whitespace-nowrap py-3">
          <div className="scroll-bar flex gap-12 text-sm text-slate-500">
            <span>
              <span className="text-orange-400">///</span> {LOST_BTC.toLocaleString("de-DE")} BTC permanent verloren
            </span>
            <span>
              <span className="text-red-400">///</span> Chainalysis Schatzung: 20% aller BTC sind unwiederbringlich
            </span>
            <span>
              <span className="text-amber-400">///</span> James Howells: 8.000 BTC auf einer Mulldeponie in Wales
            </span>
            <span>
              <span className="text-purple-400">///</span> Stefan Thomas: 7.002 BTC — Passwort zu IronKey verloren
            </span>
            <span>
              <span className="text-emerald-400">///</span> DAIO — Digital Asset Inheritance Orchestration — Back2IQ
            </span>
            <span>
              <span className="text-blue-400">///</span> Nur Governance schutzt vor Zugangsverlust — keine Verwahrung notig
            </span>
            {/* Duplicate for seamless loop */}
            <span>
              <span className="text-orange-400">///</span> {LOST_BTC.toLocaleString("de-DE")} BTC permanent verloren
            </span>
            <span>
              <span className="text-red-400">///</span> Chainalysis Schatzung: 20% aller BTC sind unwiederbringlich
            </span>
            <span>
              <span className="text-amber-400">///</span> James Howells: 8.000 BTC auf einer Mulldeponie in Wales
            </span>
            <span>
              <span className="text-purple-400">///</span> Stefan Thomas: 7.002 BTC — Passwort zu IronKey verloren
            </span>
            <span>
              <span className="text-emerald-400">///</span> DAIO — Digital Asset Inheritance Orchestration — Back2IQ
            </span>
            <span>
              <span className="text-blue-400">///</span> Nur Governance schutzt vor Zugangsverlust — keine Verwahrung notig
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/30 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Datenquelle: CoinGecko API | BTC-Verlustschatzung: Chainalysis
            Research
          </p>
          <p className="text-xs text-slate-600">
            Back2IQ — Ahead by Design | DAIO Framework
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  borderColor: string;
}) {
  return (
    <div
      className={`bg-slate-900/50 border ${borderColor} rounded-2xl p-5 animate-slide-up`}
    >
      <div className="flex items-center gap-2 mb-3">{icon}
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function ReasonCard({
  percent,
  title,
  desc,
  color,
}: {
  percent: number;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-black text-white">{percent}%</span>
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}

export default App;
