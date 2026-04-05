import { cn } from "@/lib/utils";
import { useInView } from "../../hooks/use-in-view";

interface SectionWrapperProps {
  id: string;
  children: (isVisible: boolean) => React.ReactNode;
  className?: string;
  withDotGrid?: boolean;
}

export function SectionWrapper({ id, children, className, withDotGrid = false }: SectionWrapperProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "scroll-section",
        withDotGrid && "dot-grid",
        className
      )}
    >
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        {children(isInView)}
      </div>
    </section>
  );
}
