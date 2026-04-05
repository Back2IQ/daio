import { useState, useMemo } from "react";
import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { Button } from "@/components/ui/button";
import { generateLossData, ASSET_CATEGORIES, type AssetCategory } from "../../data/loss-model";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const DAY_OPTIONS = [30, 90, 365] as const;

export function LossVisualizerSection() {
  const [selectedDays, setSelectedDays] = useState<30 | 90 | 365>(90);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "all">("all");

  const lossData = useMemo(
    () => generateLossData(selectedDays, selectedCategory === "all" ? undefined : selectedCategory),
    [selectedDays, selectedCategory]
  );

  const finalPoint = lossData[lossData.length - 1];
  const delta = (finalPoint.withDAIO - finalPoint.withoutGovernance).toFixed(1);
  const lostPct = (100 - finalPoint.withoutGovernance).toFixed(1);

  return (
    <SectionWrapper id="loss-visualizer">
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-blue-400 uppercase tracking-widest mb-3">Interactive Model</p>
            <h2 className="text-4xl md:text-5xl font-bold">Loss Visualizer</h2>
            <p className="text-muted-foreground mt-2">What happens to digital assets without governance?</p>
          </div>

          {/* Controls */}
          <div className={`flex flex-wrap items-center justify-center gap-4 mb-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {DAY_OPTIONS.map((d) => (
                <Button
                  key={d}
                  variant={selectedDays === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDays(d)}
                >
                  {d} Days
                </Button>
              ))}
            </div>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <Button
                variant={selectedCategory === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Assets
              </Button>
              {ASSET_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <GlassCard className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart key={`${selectedDays}-${selectedCategory}`} data={lossData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: "Days", position: "insideBottom", offset: -2, fill: "#64748b" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit="%" domain={[0, 105]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.75rem",
                    backdropFilter: "blur(12px)",
                    color: "#e2e8f0",
                  }}
                  labelFormatter={(day) => `Day ${day}`}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === "withoutGovernance" ? "Without Governance" : "With DAIO",
                  ]}
                />
                <Legend formatter={(value) => value === "withoutGovernance" ? "Without Governance" : "With DAIO"} />
                <Line type="monotone" dataKey="withoutGovernance" stroke="#ef4444" strokeWidth={2.5} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="withDAIO" stroke="#34d399" strokeWidth={2.5} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Insight */}
          <div className={`mt-6 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <GlassCard className="inline-block">
              <p className="text-sm">
                After <span className="font-bold text-amber-400">{selectedDays} days</span>, assets without governance lose{" "}
                <span className="font-bold text-red-400">{lostPct}%</span> of their value.
                DAIO preserves a <span className="font-bold text-emerald-400">+{delta}%</span> advantage.
              </p>
            </GlassCard>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
