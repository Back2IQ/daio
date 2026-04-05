import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { usePipelineStore } from "../../store/pipeline-store";
import { validationRules } from "../../config/rules";
import { cn } from "@/lib/utils";

export function RulesCheckPanel() {
  const blocks = usePipelineStore((s) => s.blocks);
  const currentBlockIndex = usePipelineStore((s) => s.currentBlockIndex);
  const rewrites = usePipelineStore((s) => s.rewrites);

  const block = blocks[currentBlockIndex];
  if (!block) return null;

  const rewrite = rewrites[block.id];
  const results = rewrite?.validationResults ?? [];
  const hasRewrite = !!rewrite?.rewrittenText;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {hasRewrite
          ? `${results.filter((r) => r.passed).length}/${results.length} rules passed`
          : "Generate a rewrite to run validation"}
      </p>

      <div className="space-y-1">
        {validationRules.map((rule) => {
          const result = results.find((r) => r.ruleId === rule.id);

          let icon;
          let textColor;
          if (!hasRewrite || !result) {
            icon = <MinusCircle className="size-3.5 text-muted-foreground/50" />;
            textColor = "text-muted-foreground/50";
          } else if (result.passed) {
            icon = <CheckCircle2 className="size-3.5 text-green-600" />;
            textColor = "text-foreground";
          } else if (result.severity === "warning") {
            icon = <AlertTriangle className="size-3.5 text-amber-500" />;
            textColor = "text-amber-700";
          } else {
            icon = <XCircle className="size-3.5 text-red-600" />;
            textColor = "text-red-700";
          }

          return (
            <div
              key={rule.id}
              className={cn(
                "flex items-start gap-2 rounded-md px-2 py-1.5 text-xs",
                result && !result.passed && result.severity === "error" && "bg-red-50",
                result && !result.passed && result.severity === "warning" && "bg-amber-50"
              )}
            >
              <span className="mt-0.5 shrink-0">{icon}</span>
              <div>
                <p className={cn("font-medium", textColor)}>{rule.name}</p>
                {result && !result.passed && (
                  <p className="text-muted-foreground mt-0.5">{result.message}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Show any additional results not in the standard rules */}
        {results
          .filter(
            (r) =>
              !validationRules.some((vr) => vr.id === r.ruleId) && !r.passed
          )
          .map((result, i) => (
            <div
              key={`extra-${i}`}
              className={cn(
                "flex items-start gap-2 rounded-md px-2 py-1.5 text-xs",
                result.severity === "error" ? "bg-red-50" : "bg-amber-50"
              )}
            >
              <span className="mt-0.5 shrink-0">
                {result.severity === "error" ? (
                  <XCircle className="size-3.5 text-red-600" />
                ) : (
                  <AlertTriangle className="size-3.5 text-amber-500" />
                )}
              </span>
              <div>
                <p className="font-medium">{result.ruleName}</p>
                <p className="text-muted-foreground mt-0.5">{result.message}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
