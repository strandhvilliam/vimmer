import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Alert } from "@vimmer/ui/components/alert";
import { toast } from "sonner";
import { CloudUpload, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { UploadZone } from "./upload-zone";
import { usePhotoStore } from "@/lib/stores/photo-store";
import { usePresignedSubmissions } from "@/hooks/use-presigned-submissions";
import { Marathon, Topic } from "@vimmer/api/db/types";
import { RuleConfig, RuleKey } from "@vimmer/validation/types";
import {
  RULE_KEYS,
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "@vimmer/validation/constants";

interface UploadSectionProps {
  maxPhotos: number;
  onUpload: () => void;
  ruleConfigs: RuleConfig<RuleKey>[];
  topics: Topic[];
  marathon: Marathon;
}

export default function UploadSection({
  maxPhotos,
  onUpload,
  ruleConfigs,
  topics,
  marathon,
}: UploadSectionProps) {
  const { photos, validateAndAddPhotos, validationResults } = usePhotoStore();
  const { data: presignedSubmissions = [] } = usePresignedSubmissions();

  const allPhotosSelected =
    photos.length === maxPhotos &&
    photos.length > 0 &&
    presignedSubmissions.length > 0;

  const hasValidationErrors = validationResults.some(
    (result) =>
      result.outcome === VALIDATION_OUTCOME.FAILED &&
      result.severity === SEVERITY_LEVELS.ERROR
  );

  const hasValidationWarnings = validationResults.some(
    (result) =>
      result.outcome === VALIDATION_OUTCOME.FAILED &&
      result.severity === SEVERITY_LEVELS.WARNING
  );

  const errorMessages = validationResults
    .filter(
      (result) =>
        result.outcome === VALIDATION_OUTCOME.FAILED &&
        result.severity === SEVERITY_LEVELS.ERROR
    )
    .map((result) => ({
      message: result.message,
      fileName: result.fileName,
    }));

  const warningMessages = validationResults
    .reduce(
      (acc, result) => {
        if (
          result.outcome === VALIDATION_OUTCOME.FAILED &&
          result.severity === SEVERITY_LEVELS.WARNING
        ) {
          const existingMessage = acc.find((m) => m.message === result.message);
          if (!existingMessage) {
            acc.push({
              message: result.message,
              fileName: result.fileName,
            });
          }
        }
        return acc;
      },
      [] as { message: string; fileName: string | undefined }[]
    )
    .map((result) => ({
      message: result.message,
      fileName: result.fileName,
    }));

  return (
    <AnimatePresence mode="wait">
      {hasValidationErrors ? (
        <motion.div
          key="validation-errors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-destructive/40 bg-destructive/5 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors">
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <AlertTriangle className="h-20 w-20 text-destructive" />
              <div className="text-center space-y-4 max-w-md">
                <p className="text-base font-medium text-destructive">
                  Photo Validation Errors
                </p>
                <div className="space-y-2">
                  {errorMessages.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground bg-background/50 rounded-md p-3 border"
                    >
                      {error.fileName && (
                        <p className="font-medium text-foreground mb-1">
                          {error.fileName}
                        </p>
                      )}
                      <p>{error.message}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Please fix these issues before proceeding
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : allPhotosSelected ? (
        <motion.div
          key="all-photos-selected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/40 bg-background/40 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors">
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <CloudUpload className="h-20 w-20 text-primary" />
              <p className="text-base text-center text-muted-foreground max-w-md">
                All photos selected - ready to upload
              </p>

              {hasValidationWarnings && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="ml-2">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm mt-1">
                      Some validation warnings were found. You may still upload,
                      but the submission will be marked for manual review.
                    </p>
                    <div className="mt-3 space-y-1">
                      {warningMessages.map((warning, index) => (
                        <div
                          key={index}
                          className="text-xs bg-amber-100 dark:bg-amber-900/30 rounded px-2 py-1"
                        >
                          {warning.fileName && (
                            <span className="font-medium">
                              {warning.fileName}:{" "}
                            </span>
                          )}
                          <span>{warning.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Alert>
              )}

              <PrimaryButton
                onClick={onUpload}
                disabled={!presignedSubmissions}
                className="w-full py-3 text-base rounded-full"
              >
                Upload Now
              </PrimaryButton>
            </CardContent>
          </Card>
        </motion.div>
      ) : presignedSubmissions.length > 0 ? (
        <motion.div
          key="upload-zone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UploadZone
            onDrop={(acceptedFiles) =>
              validateAndAddPhotos({
                files: acceptedFiles,
                ruleConfigs: ruleConfigs.map((rule) => {
                  if (rule.key === RULE_KEYS.WITHIN_TIMERANGE) {
                    return {
                      ...rule,
                      params: {
                        ...rule.params,
                        start: marathon.startDate,
                        end: marathon.endDate,
                      },
                    };
                  }
                  return rule;
                }),
                orderIndexes: topics.map((topic) => topic.orderIndex),
                maxPhotos,
              })
            }
            isDisabled={photos.length >= maxPhotos}
            currentCount={photos.length}
            maxCount={maxPhotos}
            onDropRejected={(fileRejections) => {
              fileRejections.forEach((rejection) => {
                rejection.errors.forEach((error) => {
                  toast.error(error.message);
                });
              });
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="loading-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-2 border-dashed border-muted-foreground/40 bg-background/60 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-center flex flex-col justify-center items-center">
              <Skeleton className="h-20 w-20 rounded-full mb-4" />
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
