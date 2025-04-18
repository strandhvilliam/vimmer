import { SelectedPhotoV2 } from "@/lib/types";
import { ChevronDown, ChevronUp, ImageIcon, Info, X } from "lucide-react";
import { motion } from "framer-motion";
import { ValidationStatusBadge } from "./validation-status-badge";
import {
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
  ValidationResult,
} from "@vimmer/validation";
import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import { Topic } from "@vimmer/supabase/types";

interface Props {
  photo?: SelectedPhotoV2;
  validationResults?: ValidationResult[];
  topic?: Topic;
  index: number;
  onRemove?: () => void;
}

export function SubmissionItem({
  photo,
  validationResults,
  topic,
  index,
  onRemove,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const r = validationResults?.sort((a, b) => {
    if (a.outcome !== b.outcome) {
      if (a.outcome === VALIDATION_OUTCOME.FAILED) return -1;
      if (b.outcome === VALIDATION_OUTCOME.FAILED) return 1;
      if (a.outcome === VALIDATION_OUTCOME.SKIPPED) return -1;
      if (b.outcome === VALIDATION_OUTCOME.SKIPPED) return 1;
    }

    if (a.severity !== b.severity) {
      if (a.severity === SEVERITY_LEVELS.ERROR) return -1;
      if (b.severity === SEVERITY_LEVELS.ERROR) return 1;
    }

    return 0;
  });

  const highestPriorityResult = r?.[0];

  const displayValidation = {
    message: highestPriorityResult?.message,
    outcome: highestPriorityResult?.outcome,
    severity: highestPriorityResult?.severity,
    ruleKey: highestPriorityResult?.ruleKey,
  };

  if (!photo) {
    return (
      <div className="flex flex-row gap-4 p-4 border rounded-lg bg-background">
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-base text-muted-foreground"># {index + 1}</p>
            <p className="font-medium">{topic?.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">No photo selected</p>
        </div>
        <div className="md:w-[100px] md:h-[100px] w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 shrink-0">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      </div>
    );
  }

  const exifData = photo.exif || {};
  const relevantExifData = getRelevantExifData(exifData);
  const hasExifData = Object.keys(relevantExifData).length > 0;

  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden">
      <div className="flex flex-row gap-4 p-4">
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-base text-muted-foreground">
              # {photo.orderIndex} {index + 1}
            </p>
            <p className="font-medium">{topic?.name}</p>
          </div>

          {validationResults && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ValidationStatusBadge
                  outcome={displayValidation.outcome}
                  severity={displayValidation.severity}
                />

                {/* {photo.validationRuleKey &&
                  photo.validationOutcome !== VALIDATION_OUTCOME.PASSED && (
                    <span className="text-xs text-muted-foreground">
                      {formatRuleKey(photo.validationRuleKey)}
                    </span>
                  )} */}
              </div>

              {displayValidation.message &&
                displayValidation.outcome !== VALIDATION_OUTCOME.PASSED && (
                  <p
                    className={`text-xs ${
                      displayValidation.severity === SEVERITY_LEVELS.ERROR
                        ? "text-destructive"
                        : displayValidation.outcome ===
                            VALIDATION_OUTCOME.FAILED
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {displayValidation.message}
                  </p>
                )}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Size: {formatFileSize(photo.file.size)}
          </p>

          {hasExifData && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 h-7 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Photo details</span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
        <div className="relative w-[100px] h-[100px] shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full rounded-lg overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.preview}
              alt={`Upload preview ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </motion.div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {expanded && hasExifData && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-3 border-t"
        >
          <table className="w-full text-xs mt-2">
            <tbody>
              {Object.entries(relevantExifData).map(([key, value]) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <td className="py-1.5 font-medium text-muted-foreground">
                    {key}
                  </td>
                  <td className="py-1.5 text-right">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatRuleKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRelevantExifData(exif: {
  [key: string]: unknown;
}): Record<string, string> {
  const relevantData: Record<string, string> = {};

  // Guard against undefined or null exif data
  if (!exif) return relevantData;

  console.log({ exif });

  // Camera info
  if (exif.Make && typeof exif.Make === "string")
    relevantData["Camera Make"] = exif.Make;
  if (exif.Model && typeof exif.Model === "string")
    relevantData["Camera Model"] = exif.Model;

  // Exposure settings
  if (exif.ExposureTime && typeof exif.ExposureTime === "number") {
    const exposureValue = exif.ExposureTime;
    relevantData["Exposure"] =
      exposureValue < 1
        ? `1/${Math.round(1 / exposureValue)}s`
        : `${exposureValue}s`;
  }

  if (exif.FNumber && typeof exif.FNumber === "number") {
    relevantData["Aperture"] = `f/${exif.FNumber}`;
  }

  if (
    exif.ISO &&
    (typeof exif.ISO === "number" || typeof exif.ISO === "string")
  ) {
    relevantData["ISO"] = `ISO ${exif.ISO}`;
  }

  if (exif.FocalLength && typeof exif.FocalLength === "number") {
    relevantData["Focal Length"] = `${exif.FocalLength}mm`;
  }

  // Date & time
  if (exif.DateTimeOriginal) {
    try {
      const dateString = String(exif.DateTimeOriginal);
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        relevantData["Date Taken"] = date.toLocaleDateString();
        relevantData["Time Taken"] = date.toLocaleTimeString();
      }
    } catch (error) {
      // Skip if date parsing fails
    }
  }

  // Lens info
  if (exif.LensModel && typeof exif.LensModel === "string") {
    relevantData["Lens"] = exif.LensModel;
  }

  // GPS
  if (
    exif.latitude &&
    exif.longitude &&
    typeof exif.latitude === "number" &&
    typeof exif.longitude === "number"
  ) {
    relevantData["GPS"] =
      `${exif.latitude.toFixed(6)}, ${exif.longitude.toFixed(6)}`;
  }

  return relevantData;
}
