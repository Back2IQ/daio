import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "hook", label: "Hook" },
  { id: "problem", label: "Problem" },
  { id: "pioneer-case", label: "Case" },
  { id: "loss-visualizer", label: "Visualizer" },
  { id: "inference", label: "Inference" },
  { id: "framework", label: "Framework" },
  { id: "numbers", label: "Numbers" },
  { id: "cta", label: "CTA" },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState("hook");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.5 }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className="group flex items-center gap-2"
          title={s.label}
        >
          <span className={cn(
            "text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground",
            activeSection === s.id && "opacity-100 text-blue-400"
          )}>
            {s.label}
          </span>
          <span className={cn(
            "block rounded-full transition-all duration-300",
            activeSection === s.id
              ? "w-3 h-3 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              : "w-2 h-2 bg-white/30 hover:bg-white/60"
          )} />
        </button>
      ))}
    </nav>
  );
}
