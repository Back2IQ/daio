import { SectionWrapper } from "../shared/SectionWrapper";
import { AnimatedValue } from "../shared/AnimatedValue";
import { ScrollIndicator } from "../shared/ScrollIndicator";
import { HOOK_DATA } from "../../data/pitch-data";

export function HookSection() {
  return (
    <SectionWrapper id="hook" className="hero-glow" withDotGrid>
      {(isVisible) => (
        <>
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className={`mb-12 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <img src="/logo.png" alt="Back2IQ" className="h-14 w-auto mx-auto" />
            </div>

            {/* Big number */}
            <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <p className="text-lg text-muted-foreground mb-4 uppercase tracking-widest">Invisible Losses</p>
              <h1 className="text-7xl md:text-9xl font-black gradient-text leading-none mb-2">
                <AnimatedValue
                  value={HOOK_DATA.headlineNumber}
                  isVisible={isVisible}
                  prefix={HOOK_DATA.currency}
                  suffix={` ${HOOK_DATA.unit}`}
                  decimals={1}
                  duration={2500}
                />
              </h1>
            </div>

            {/* Subtitle */}
            <div className={`mt-8 max-w-2xl transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                {HOOK_DATA.subtitle}
              </p>
            </div>

            {/* Tagline */}
            <div className={`mt-12 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <p className="text-sm text-blue-400/60 uppercase tracking-[0.3em]">
                Digital Asset Inheritance Orchestration
              </p>
            </div>
          </div>

          <ScrollIndicator />
        </>
      )}
    </SectionWrapper>
  );
}
