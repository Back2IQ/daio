import { SectionWrapper } from "../shared/SectionWrapper";
import { Mail, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <SectionWrapper id="cta" className="hero-glow" withDotGrid>
      {(isVisible) => (
        <div className="w-full">
          {/* Header */}
          <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-sm text-emerald-400 uppercase tracking-widest mb-3">Next Step</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Evaluate the Framework
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No commitment. No sales pitch. 30 minutes to understand
              if the framework fits your practice.
            </p>
          </div>

          {/* CTA Button */}
          <div className={`flex justify-center mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
            <a
              href="mailto:dk@back2iq.com.tr?subject=DAIO%20Framework%20Introduction"
              className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 no-underline"
            >
              <span className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                Request Introduction
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>

          {/* Footer branding */}
          <div className={`mt-12 flex flex-col items-center gap-4 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="flex items-center gap-4">
              <img src="/app/logo.png" alt="Back2IQ" className="h-10 w-auto" />
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
      )}
    </SectionWrapper>
  );
}
