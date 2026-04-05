import { SectionNav } from "./components/shared/SectionNav";
import { HookSection } from "./components/sections/HookSection";
import { ProblemSection } from "./components/sections/ProblemSection";
import { PioneerCaseSection } from "./components/sections/PioneerCaseSection";
import { LossVisualizerSection } from "./components/sections/LossVisualizerSection";
import { InferenceEngineSection } from "./components/sections/InferenceEngineSection";
import { FrameworkSection } from "./components/sections/FrameworkSection";
import { NumbersSection } from "./components/sections/NumbersSection";
import { CTASection } from "./components/sections/CTASection";

export default function App() {
  return (
    <div className="scroll-container bg-background">
      <SectionNav />
      <HookSection />
      <ProblemSection />
      <PioneerCaseSection />
      <LossVisualizerSection />
      <InferenceEngineSection />
      <FrameworkSection />
      <NumbersSection />
      <CTASection />
    </div>
  );
}
