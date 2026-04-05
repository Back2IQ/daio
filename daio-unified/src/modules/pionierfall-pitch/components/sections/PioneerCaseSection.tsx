import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { AnimatedValue } from "../shared/AnimatedValue";
import { PIONEER_CASE } from "../../data/pitch-data";
import { Lock, CheckCircle, ArrowRight } from "lucide-react";

function ValueBar({ value, maxValue, color, isVisible, delay }: {
  value: number; maxValue: number; color: string; isVisible: boolean; delay: number;
}) {
  const pct = (value / maxValue) * 100;
  return (
    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full value-bar"
        style={{
          width: isVisible ? `${pct}%` : "0%",
          backgroundColor: color,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

export function PioneerCaseSection() {
  return (
    <SectionWrapper id="pioneer-case" withDotGrid>
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-amber-400 uppercase tracking-widest mb-3">The Pioneer Case</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              From Loss to{" "}
              <span className="text-emerald-400">Recovery</span>
            </h2>
          </div>

          {/* Split cards */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Before */}
            <GlassCard className={`border-t-2 border-red-500/40 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold">Without DAIO</h3>
              </div>
              <div className="text-4xl font-black text-red-400 mb-1">
                €<AnimatedValue value={850} isVisible={isVisible} duration={1800} />k+
              </div>
              <p className="text-sm text-red-400/60 mb-6">Locked / Inaccessible</p>

              <div className="space-y-4">
                {PIONEER_CASE.assets.map((asset, i) => (
                  <div key={asset.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{asset.name}</span>
                      <span className="text-red-400">€{(asset.beforeValue / 1000).toFixed(0)}k</span>
                    </div>
                    <ValueBar value={asset.beforeValue} maxValue={520000} color="#ef4444" isVisible={isVisible} delay={i * 200 + 300} />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* After */}
            <GlassCard className={`border-t-2 border-emerald-500/40 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold">With DAIO Recovery</h3>
              </div>
              <div className="text-4xl font-black text-emerald-400 mb-1">
                €<AnimatedValue value={720} isVisible={isVisible} duration={1800} />k
              </div>
              <p className="text-sm text-emerald-400/60 mb-6">Recovered / Transferred</p>

              <div className="space-y-4">
                {PIONEER_CASE.assets.map((asset, i) => (
                  <div key={asset.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{asset.name}</span>
                      <span className="text-emerald-400">€{(asset.afterValue / 1000).toFixed(0)}k</span>
                    </div>
                    <ValueBar value={asset.afterValue} maxValue={520000} color={asset.color} isVisible={isVisible} delay={i * 200 + 600} />
                  </div>
                ))}
              </div>

              {/* Recovery badge */}
              <div className={`mt-6 flex items-center gap-2 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  <AnimatedValue value={PIONEER_CASE.recoveryRate} isVisible={isVisible} decimals={1} duration={2000} suffix="%" />
                  {" "}Recovery Rate
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
