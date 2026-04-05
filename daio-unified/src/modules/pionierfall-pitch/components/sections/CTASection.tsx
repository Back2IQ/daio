import { useState, useEffect } from "react";
import { SectionWrapper } from "../shared/SectionWrapper";
import { GlassCard } from "../shared/GlassCard";
import { ROADMAP_STEPS } from "../../data/pitch-data";
import { Rocket, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTASection() {
  const [activeStep, setActiveStep] = useState(0);
  const [triggered, setTriggered] = useState(false);

  const startAnimation = (isVisible: boolean) => {
    if (isVisible && !triggered) setTriggered(true);
  };

  useEffect(() => {
    if (!triggered) return;
    if (activeStep >= 3) return;
    const timer = setTimeout(() => setActiveStep((s) => s + 1), 500);
    return () => clearTimeout(timer);
  }, [triggered, activeStep]);

  return (
    <SectionWrapper id="cta" className="hero-glow" withDotGrid>
      {(isVisible) => {
        startAnimation(isVisible);
        return (
          <div className="w-full">
            {/* Header */}
            <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <p className="text-sm text-emerald-400 uppercase tracking-widest mb-3">Next Step</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Get Your{" "}
                <span className="text-emerald-400">DAIO License</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                One-time investment of €25,000 — full DAIO framework license.
                Optional hands-on accompaniment available at extra cost.
              </p>
            </div>

            {/* CTA Button */}
            <div className={`flex justify-center mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
              <button className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-3">
                  <Rocket className="w-5 h-5" />
                  Get Started — €25k
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Roadmap timeline */}
            <div className={`max-w-3xl mx-auto transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-6">
                6-Week Implementation Roadmap
              </h3>
              <div className="flex items-center gap-0">
                {ROADMAP_STEPS.map((step, i) => (
                  <div key={step.week} className="flex-1 flex flex-col items-center">
                    {/* Step node */}
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-500 mb-3",
                      i < activeStep
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.3)]"
                        : "border-slate-700 bg-slate-800/50 text-slate-600"
                    )}>
                      W{step.week}
                    </div>
                    <GlassCard className={cn(
                      "text-center transition-all duration-500",
                      i < activeStep ? "opacity-100" : "opacity-40"
                    )}>
                      <p className="font-semibold text-sm mb-1">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer branding */}
            <div className={`mt-12 flex flex-col items-center gap-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Back2IQ" className="h-10 w-auto" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span>Back2IQ — Ahead by Design</span>
              </div>
              <p className="text-xs text-muted-foreground/50">
                DAIO — Digital Asset Inheritance Orchestration | Sovereign Guard Architecture
              </p>
            </div>
          </div>
        );
      }}
    </SectionWrapper>
  );
}
