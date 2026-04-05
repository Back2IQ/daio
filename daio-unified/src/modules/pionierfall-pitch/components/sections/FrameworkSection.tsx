import { useState, useEffect } from "react";
import { SectionWrapper } from "../shared/SectionWrapper";
import { PIPELINE_PHASES } from "../../data/pitch-data";
import {
  UserPlus, Search, Package, FileCheck, KeyRound,
  Eye, Zap, CheckCircle, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  UserPlus: <UserPlus className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  FileCheck: <FileCheck className="w-5 h-5" />,
  KeyRound: <KeyRound className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
};

export function FrameworkSection() {
  const [activeCount, setActiveCount] = useState(0);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [triggered, setTriggered] = useState(false);

  const startAnimation = (isVisible: boolean) => {
    if (isVisible && !triggered) {
      setTriggered(true);
    }
  };

  useEffect(() => {
    if (!triggered) return;
    if (activeCount >= 9) return;
    const timer = setTimeout(() => setActiveCount((c) => c + 1), 180);
    return () => clearTimeout(timer);
  }, [triggered, activeCount]);

  return (
    <SectionWrapper id="framework">
      {(isVisible) => {
        startAnimation(isVisible);
        return (
          <div className="w-full">
            {/* Header */}
            <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <p className="text-sm text-cyan-400 uppercase tracking-widest mb-3">The Solution</p>
              <h2 className="text-4xl md:text-5xl font-bold">
                DAIO <span className="text-cyan-400">Framework</span>
              </h2>
              <p className="text-muted-foreground mt-2">9-Phase Governance Pipeline</p>
            </div>

            {/* Pipeline - Desktop */}
            <div className="hidden lg:flex items-center justify-between gap-1 mb-8">
              {PIPELINE_PHASES.map((phase, i) => {
                const isActive = i < activeCount;
                const isHovered = hoveredPhase === phase.id;
                return (
                  <div key={phase.id} className="flex items-center gap-1 flex-1">
                    {/* Phase node */}
                    <button
                      onMouseEnter={() => setHoveredPhase(phase.id)}
                      onMouseLeave={() => setHoveredPhase(null)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-500 w-full",
                        isActive
                          ? "opacity-100"
                          : "opacity-30",
                        isHovered && "bg-white/5 scale-105"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                        isActive
                          ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                          : "border-slate-700 bg-slate-800/50 text-slate-600"
                      )}>
                        {ICONS[phase.icon]}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium text-center leading-tight transition-colors duration-300",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {phase.name}
                      </span>
                    </button>
                    {/* Connector */}
                    {i < 8 && (
                      <div className="w-4 h-0.5 shrink-0">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-500",
                          i < activeCount - 1 ? "bg-blue-500/50" : "bg-slate-700/50"
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pipeline - Mobile */}
            <div className="lg:hidden grid grid-cols-3 gap-3 mb-8">
              {PIPELINE_PHASES.map((phase, i) => {
                const isActive = i < activeCount;
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-500",
                      isActive ? "opacity-100" : "opacity-30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                      isActive
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-600"
                    )}>
                      {ICONS[phase.icon]}
                    </div>
                    <span className="text-[9px] font-medium text-center leading-tight">{phase.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Description tooltip */}
            <div className={cn(
              "text-center h-16 transition-all duration-300",
              hoveredPhase ? "opacity-100" : "opacity-0"
            )}>
              {hoveredPhase && (
                <div className="inline-block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3">
                  <p className="text-sm font-medium text-blue-400">Phase {hoveredPhase}</p>
                  <p className="text-sm text-muted-foreground">
                    {PIPELINE_PHASES.find((p) => p.id === hoveredPhase)?.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </SectionWrapper>
  );
}
