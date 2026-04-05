import { useMemo } from "react";
import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { INFERENCE_STEPS, generateDensityCurve, CONFIDENCE_INTERVAL } from "../../data/inference-model";
import { FileStack, BrainCircuit, TrendingUp, ArrowRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  ReferenceLine, ResponsiveContainer, Tooltip,
} from "recharts";

const ICONS: Record<string, React.ReactNode> = {
  FileStack: <FileStack className="w-8 h-8" />,
  BrainCircuit: <BrainCircuit className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
};

export function InferenceEngineSection() {
  const densityData = useMemo(() => generateDensityCurve(), []);

  return (
    <SectionWrapper id="inference" withDotGrid>
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-purple-400 uppercase tracking-widest mb-3">Statistical Rigor</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Reverse-Inference{" "}
              <span className="text-purple-400">Engine</span>
            </h2>
            <p className="text-muted-foreground mt-2">From sparse data to population-level estimates</p>
          </div>

          {/* 3-step flow */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {INFERENCE_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <GlassCard
                  className={`flex-1 text-center transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${i === 1 ? "animate-pulse-glow" : ""}`}
                  style={{ transitionDelay: `${i * 250}ms` } as React.CSSProperties}
                >
                  <div className="flex justify-center mb-3 text-purple-400">
                    {ICONS[step.icon]}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{step.label}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </GlassCard>
                {i < 2 && (
                  <ArrowRight className={`w-5 h-5 text-purple-400/50 shrink-0 hidden md:block transition-all duration-700 ${
                    isVisible ? "opacity-100" : "opacity-0"
                  }`} style={{ transitionDelay: `${(i + 1) * 250}ms` } as React.CSSProperties} />
                )}
              </div>
            ))}
          </div>

          {/* Density curve */}
          <GlassCard className={`transition-all duration-700 delay-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Posterior Distribution — Estimated Hidden Losses
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={densityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="x"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Estimated Loss (€ Billion)", position: "insideBottom", offset: -2, fill: "#64748b" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.75rem",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => [`${value}`, "Density"]}
                  labelFormatter={(x) => `€${x} Billion`}
                />
                <Area type="monotone" dataKey="density" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth={2} animationDuration={2000} />
                <ReferenceLine x={CONFIDENCE_INTERVAL.lower} stroke="#fbbf24" strokeDasharray="5 5" />
                <ReferenceLine x={CONFIDENCE_INTERVAL.upper} stroke="#fbbf24" strokeDasharray="5 5" />
                <ReferenceLine x={CONFIDENCE_INTERVAL.median} stroke="#34d399" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-emerald-400 block" />
                <span>Median: €{CONFIDENCE_INTERVAL.median} Bn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-400 block border-dashed" style={{ borderTop: "2px dashed #fbbf24", height: 0 }} />
                <span>95% CI: €{CONFIDENCE_INTERVAL.lower}–{CONFIDENCE_INTERVAL.upper} Bn</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </SectionWrapper>
  );
}
