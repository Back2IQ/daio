import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
      <span className="text-xs uppercase tracking-widest">Scroll</span>
      <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
    </div>
  );
}
