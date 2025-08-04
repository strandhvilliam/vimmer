import { Topic, Submission, ValidationResult } from "@vimmer/api/db/types";
import { AccordionTrigger } from "@vimmer/ui/components/accordion";
import {
  ImageIcon,
  XIcon,
  AlertTriangle,
  CheckCircleIcon,
  FileQuestion,
} from "lucide-react";
import { useState } from "react";

interface ValidationTriggerItemProps {
  topic?: Topic;
  orderIndex?: number;
  submission?: Submission | null;
  validations: ValidationResult[];
  thumbnailUrl?: string | null;
  title?: string;
  isGlobal?: boolean;
  onThumbnailClick?: () => void;
}

export function ValidationTriggerItem({
  topic,
  orderIndex,
  submission,
  validations,
  thumbnailUrl,
  title,
  isGlobal = false,
  onThumbnailClick,
}: ValidationTriggerItemProps) {
  const [isBroken, setIsBroken] = useState(false);
  const errorCount = validations.filter(
    (v) => v.severity === "error" && v.outcome === "failed",
  ).length;
  const warningCount = validations.filter(
    (v) => v.severity === "warning" && v.outcome === "failed",
  ).length;
  const passedCount = validations.filter((v) => v.outcome === "passed").length;
  const skippedCount = validations.filter(
    (v) => v.outcome === "skipped",
  ).length;

  return (
    <AccordionTrigger className="flex items-center gap-3 w-full text-left p-3 hover:bg-muted/40 transition-all rounded-lg hover:no-underline group">
      {!isGlobal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onThumbnailClick?.();
          }}
          className="w-14 h-14 rounded-lg overflow-hidden bg-muted/40 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
        >
          {thumbnailUrl ? (
            !isBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={topic?.name}
                onError={(e) => {
                  setIsBroken(true);
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          {!isGlobal && (
            <div className="w-5 h-5 rounded-full bg-muted  flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {(orderIndex ?? 0) + 1}
              </span>
            </div>
          )}
          {isGlobal ? (
            <span className="text-sm font- text-foreground">
              General Validations
            </span>
          ) : (
            <h5 className="text-sm font-semibold text-foreground truncate">
              {topic?.name || title}
            </h5>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {validations.length > 0 ? (
            <>
              {errorCount > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <XIcon className="w-3 h-3" />
                  <span>{errorCount}</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{warningCount}</span>
                </div>
              )}
              {passedCount > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <CheckCircleIcon className="w-3 h-3" />
                  <span>{passedCount}</span>
                </div>
              )}
              {skippedCount > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <FileQuestion className="w-3 h-3" />
                  <span>{skippedCount}</span>
                </div>
              )}
            </>
          ) : (
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {isGlobal
                ? "No global validations"
                : submission
                  ? "No validations"
                  : "No submission"}
            </div>
          )}
        </div>
      </div>
    </AccordionTrigger>
  );
}
