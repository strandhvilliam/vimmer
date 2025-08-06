import { SelectedPhotoV2 } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { ValidationStatusBadge } from "@/components/validation-status-badge";
import { ValidationResult } from "@vimmer/validation/types";
import {
  VALIDATION_OUTCOME,
  SEVERITY_LEVELS,
} from "@vimmer/validation/constants";
import { useMemo, useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Topic } from "@vimmer/supabase/types";
import { format } from "date-fns";

interface Props {
  photo?: SelectedPhotoV2;
  validationResults?: ValidationResult[];
  topic?: Topic;
  index: number;
  onRemove?: () => void;
  onUploadClick?: () => void;
}

export function SubmissionItem({
  photo,
  validationResults,
  topic,
  index,
  onRemove,
  onUploadClick,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const r = useMemo(() => {
    return validationResults?.sort((a, b) => {
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
  }, [validationResults]);

  const displayValidation = useMemo(() => {
    const highestPriorityResult = r?.[0];
    if (photo?.exif && Object.keys(photo.exif).length === 0) {
      return {
        message: "No EXIF data found",
        outcome: VALIDATION_OUTCOME.FAILED,
        severity: SEVERITY_LEVELS.WARNING,
      };
    }

    return {
      message: highestPriorityResult?.message,
      outcome: highestPriorityResult?.outcome,
      severity: highestPriorityResult?.severity,
      ruleKey: highestPriorityResult?.ruleKey,
    };
  }, [r, photo?.exif]);

  const exifData = photo?.exif || {};
  const relevantExifData = getRelevantExifData(exifData);
  const hasExifData = Object.keys(relevantExifData).length > 0;
  const takenAt = getTimeTaken(photo?.exif);

  if (!photo) {
    return (
      <div
        className={`flex flex-row gap-4 p-4 border rounded-lg bg-background ${
          onUploadClick
            ? "cursor-pointer hover:bg-muted/50 transition-colors"
            : ""
        }`}
        onClick={onUploadClick}
      >
        <div className="flex-1 space-y-2">
          <div className="space-y-0">
            <p className="text-base text-muted-foreground">#{index + 1}</p>
            <p className="font-medium">{topic?.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {onUploadClick ? "Click to select photo" : "No photo selected"}
          </p>
        </div>
        <div className="md:w-[100px] md:h-[100px] w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 shrink-0">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden">
      <div className="flex flex-row gap-4 p-4">
        <div className="flex-1 space-y-2">
          <div className="space-y-0">
            <p className="text-base text-muted-foreground">#{index + 1}</p>
            <p className="font-medium">{topic?.name}</p>
          </div>

          {validationResults && validationResults.length === 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ValidationStatusBadge
                  outcome={VALIDATION_OUTCOME.PASSED}
                  severity={SEVERITY_LEVELS.ERROR}
                />
              </div>
            </div>
          )}

          {validationResults && validationResults.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ValidationStatusBadge
                  outcome={displayValidation.outcome}
                  severity={displayValidation.severity}
                />
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

          <div className="flex flex-col gap-0.5">
            <p className="text-xs  text-muted-foreground">
              {takenAt && `Taken: ${format(takenAt, "cccc, HH:mm")}`} |{" "}
              {photo.file.name && `File: ${photo.file.name}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
        </div>
        <div className="relative w-[100px] h-[100px] shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full rounded-lg overflow-hidden"
          >
            {photo.thumbnailLoading ? (
              <div className="w-full h-full bg-muted/50 border-2 border-dashed rounded-lg flex items-center justify-end pb-3 flex-col gap-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeatType: "loop",
                    ease: "linear",
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <Loader2 className="h-6 w-6 text-muted-foreground" />
                </motion.div>
                <span className="text-[0.6rem] text-muted-foreground text-center">
                  Loading
                  <br /> Preview...
                </span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photo.thumbnail ?? photo.preview}
                alt={`Upload preview ${index + 1}`}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => setShowImageDialog(true)}
              />
            )}{" "}
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

      {showImageDialog && (
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Photo Preview - {topic?.name}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <div className="w-full max-h-[70vh] overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Full preview ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function getTimeTaken(exif?: { [key: string]: unknown }): Date | null {
  if (!exif?.DateTimeOriginal) return null;

  try {
    const dateString = String(exif.DateTimeOriginal);
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    // Skip if date parsing fails
  }

  return null;
}

function getRelevantExifData(exif: {
  [key: string]: unknown;
}): Record<string, string> {
  const relevantData: Record<string, string> = {};

  // Guard against undefined or null exif data
  if (!exif) return relevantData;

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
