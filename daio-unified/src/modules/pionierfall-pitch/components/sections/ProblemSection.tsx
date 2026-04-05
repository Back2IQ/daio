import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { PERSONAS } from "../../data/pitch-data";
import { Building2, Server, Scale } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-8 h-8" />,
  Server: <Server className="w-8 h-8" />,
  Scale: <Scale className="w-8 h-8" />,
};

const COLOR_MAP: Record<string, string> = {
  blue: "text-blue-400 border-blue-500/30",
  amber: "text-amber-400 border-amber-500/30",
  emerald: "text-emerald-400 border-emerald-500/30",
};

const DOT_COLOR: Record<string, string> = {
  blue: "bg-blue-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
};

export function ProblemSection() {
  return (
    <SectionWrapper id="problem" withDotGrid>
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-red-400 uppercase tracking-widest mb-3">The Blind Spot</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Three Stakeholders.{" "}
              <span className="text-muted-foreground">Zero Data.</span>
            </h2>
          </div>

          {/* Persona cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((persona, i) => (
              <GlassCard
                key={persona.id}
                className={`border-t-2 ${COLOR_MAP[persona.color]} transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${i * 200}ms` } as React.CSSProperties}
              >
                <div className={`mb-4 ${COLOR_MAP[persona.color].split(" ")[0]}`}>
                  {ICONS[persona.icon]}
                </div>
                <h3 className="text-xl font-semibold mb-4">{persona.title}</h3>
                <ul className="space-y-3">
                  {persona.painPoints.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[persona.color]}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
