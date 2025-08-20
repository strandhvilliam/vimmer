import { HammerIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { ValidationStatusBadge } from "@/components/validation-status-badge";
import { ValidationResult } from "@vimmer/api/db/types";

interface ValidationItemProps {
  validation: ValidationResult;
  onOverrule?: (validationId: number) => void;
  isOverruling?: boolean;
  showOverruleButton?: boolean;
}

export function ValidationItem({
  validation,
  onOverrule,
  isOverruling = false,
  showOverruleButton = false,
}: ValidationItemProps) {
  const getKeyToName = (key: string) => {
    switch (key.toLowerCase()) {
      case "within_timerange":
        return "Not within timerange";
      case "same_device":
        return "Multiple devices used";
      default:
        return key.replace(/_/g, " ");
    }
  };

  return (
    <div
      key={validation.id}
      className="bg-background/50 p-3 border-b last:border-b-0 last:mb-0"
    >
      <div className="flex items-start gap-2 justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ValidationStatusBadge
            outcome={validation.outcome as "failed" | "passed" | "skipped"}
            severity={validation.severity as "error" | "warning"}
          />
          <div className="flex-1 min-w-0">
            <h6
              className={`font-medium text-sm truncate ${
                validation.outcome === "passed"
                  ? "text-green-700"
                  : validation.severity === "error"
                    ? "text-red-700"
                    : "text-amber-700"
              }`}
            >
              {getKeyToName(validation.ruleKey)}
            </h6>
          </div>
        </div>
        {validation.outcome === "failed" && validation.overruled && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground border border-muted-foreground/30">
            <HammerIcon className="h-3 w-3" />
            Overruled
          </div>
        )}
        {showOverruleButton &&
          validation.severity === "error" &&
          validation.outcome === "failed" &&
          !validation.overruled && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onOverrule?.(validation.id)}
              disabled={isOverruling}
            >
              <HammerIcon className="h-4 w-4" />
              Overrule
            </Button>
          )}
      </div>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs leading-relaxed">
          {validation.message}
        </p>
        {validation.fileName && (
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/40 text-xs font-medium text-muted-foreground">
            File: {validation.fileName}
          </div>
        )}
      </div>
    </div>
  );
}
