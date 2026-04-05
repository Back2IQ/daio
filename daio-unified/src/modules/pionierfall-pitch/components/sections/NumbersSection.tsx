import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { AnimatedValue } from "../shared/AnimatedValue";
import { KPI_CARDS } from "../../data/pitch-data";

const BORDER_COLORS: Record<string, string> = {
  blue: "border-t-blue-500",
  amber: "border-t-amber-500",
  emerald: "border-t-emerald-500",
  purple: "border-t-purple-500",
  cyan: "border-t-cyan-500",
  rose: "border-t-rose-500",
};

const TEXT_COLORS: Record<string, string> = {
  blue: "text-blue-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  rose: "text-rose-400",
};

export function NumbersSection() {
  return (
    <SectionWrapper id="numbers" withDotGrid>
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-amber-400 uppercase tracking-widest mb-3">The Business Case</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              The <span className="text-amber-400">Numbers</span>
            </h2>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {KPI_CARDS.map((kpi, i) => (
              <GlassCard
                key={kpi.label}
                className={`border-t-2 ${BORDER_COLORS[kpi.color]} text-center transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${i * 120}ms` } as React.CSSProperties}
              >
                <div className={`text-4xl md:text-5xl font-black ${TEXT_COLORS[kpi.color]} mb-2`}>
                  <AnimatedValue
                    value={kpi.value}
                    isVisible={isVisible}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    decimals={kpi.value % 1 !== 0 ? 1 : 0}
                    duration={1800}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
