"use client";

import { usePhotoManagement } from "@/lib/hooks/use-photo-management";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { useUploadManagement } from "@/lib/hooks/use-upload-management";
import { usePresignedSubmissions } from "@/lib/hooks/use-presigned-submissions";
import { CompetitionClass, Topic } from "@vimmer/supabase/types";
import exifr from "exifr";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import { toast } from "sonner";
import { useState } from "react";
import { AlertOctagon, CloudUpload, Loader2 } from "lucide-react";
import { SubmissionItem } from "@/components/submission-item";
import { UploadZone } from "@/components/upload-zone";
import { UploadProgress } from "@/components/upload-progress";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { motion } from "framer-motion";
import { SelectedPhotoV2, StepNavigationHandlers } from "@/lib/types";
import { GroupValidationStatus } from "@/components/group-validation-status";
import { usePhotoStore } from "@/lib/stores/photo-store";
import {
  runValidations,
  SEVERITY_LEVELS,
  ValidationInput,
} from "@vimmer/validation";
import { RuleKey } from "@vimmer/validation";
import { createRule } from "@vimmer/validation";
import { RULE_KEYS } from "@vimmer/validation";
import { RuleConfig } from "@vimmer/validation";
import { SubmissionsList } from "@/components/submission-list";

interface Props extends StepNavigationHandlers {
  domain: string;
  competitionClasses: CompetitionClass[];
  topics: Topic[];
}

const ruleConfigs: RuleConfig<RuleKey>[] = [
  createRule(RULE_KEYS.ALLOWED_FILE_TYPES, SEVERITY_LEVELS.ERROR, {
    allowedFileTypes: ["jpg", "jpeg"],
  }),
  createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
  createRule(RULE_KEYS.MODIFIED, SEVERITY_LEVELS.WARNING),
  createRule(RULE_KEYS.WITHIN_TIMERANGE, SEVERITY_LEVELS.ERROR, {
    start: new Date("2023-01-01"),
    end: new Date("2026-01-01"),
  }),
  createRule(RULE_KEYS.SAME_DEVICE, SEVERITY_LEVELS.ERROR),
];

export function UploadSubmissionsStep({
  domain,
  onPrevStep,
  onNextStep,
  topics,
  competitionClasses,
}: Props) {
  const {
    submissionState: { competitionClassId },
  } = useSubmissionQueryState();

  const {
    validationResults,
    photos,
    removePhoto,
    addValidationResults,
    addPhotos,
  } = usePhotoStore();

  // const { groupValidations, validateAndAddPhotos } = usePhotoManagement({
  //   topics,
  // });

  const [error, setError] = useState<string | null>(null);

  const {
    presignedObjects,
    isUploading,
    setIsUploading,
    handleUpload,
    combinedPhotos,
  } = useUploadManagement({
    photos,
  });

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId
  );

  const validateAndAddPhotos = async (files: File[]) => {
    const currentLength = photos.length;
    const maxPhotos = competitionClass?.numberOfPhotos;
    if (!currentLength || !maxPhotos) return;

    const remainingSlots = maxPhotos - currentLength;
    const sortedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);

    const newPhotos = await Promise.all(
      files.slice(0, remainingSlots).map(async (file, index) => {
        const topic = sortedTopics[currentLength + index];
        if (!topic) return null;

        const exif = await exifr.parse(file);
        return {
          file,
          exif: exif as { [key: string]: unknown },
          preview: URL.createObjectURL(file),
          orderIndex: topic.orderIndex,
        };
      })
    );

    const validPhotos = newPhotos.filter((photo) => photo !== null);

    const validationInputs = [...photos, ...validPhotos].map((photo) => ({
      exif: photo.exif,
      fileName: photo.file.name,
      fileSize: photo.file.size,
      orderIndex: photo.orderIndex,
      mimeType: photo.file.type,
    }));

    const validationResults = runValidations(ruleConfigs, validationInputs);

    addPhotos(validPhotos);
    addValidationResults(validationResults);
  };

  const allPhotosSelected =
    photos.length === competitionClass?.numberOfPhotos &&
    photos.length > 0 &&
    presignedObjects &&
    presignedObjects.length > 0;

  const handleCompleteUpload = () => {
    setIsUploading(false);
    onNextStep?.();
  };

  if (error || !competitionClass) {
    return (
      <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center py-12 px-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-destructive">
              Unable to Prepare Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AlertOctagon className="h-24 w-24 text-destructive" />
            </motion.div>
            <p className="text-lg text-center text-muted-foreground max-w-md">
              {error || "An unexpected error occurred"}
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Please contact a crew member for assistance
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={onPrevStep}
              className="w-[200px]"
            >
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <UploadProgress
        expectedCount={competitionClass.numberOfPhotos}
        files={combinedPhotos}
        onComplete={handleCompleteUpload}
        open={isUploading}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            Upload Your Photos
          </CardTitle>
          <CardDescription className="text-center">
            Submit your photos for each topic below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allPhotosSelected ? (
            <motion.div
              key="all-photos-selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-dashed border-muted-foreground/40 bg-background/40 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors">
                <CardContent className="flex flex-col items-center justify-center space-y-6">
                  <CloudUpload className="h-20 w-20 text-primary" />
                  <p className="text-base text-center text-muted-foreground max-w-md">
                    All photos selected - ready to upload
                  </p>
                  <PrimaryButton
                    onClick={handleUpload}
                    disabled={!presignedObjects}
                    className="w-full py-3 text-base rounded-full"
                  >
                    Upload Now
                  </PrimaryButton>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="upload-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {presignedObjects && presignedObjects.length > 0 ? (
                <UploadZone
                  onDrop={(acceptedFiles) =>
                    validateAndAddPhotos(acceptedFiles)
                  }
                  isDisabled={photos.length >= competitionClass.numberOfPhotos}
                  currentCount={photos.length}
                  maxCount={competitionClass.numberOfPhotos}
                  onDropRejected={(fileRejections) => {
                    fileRejections.forEach((rejection) => {
                      rejection.errors.forEach((error) => {
                        toast.error(error.message);
                      });
                    });
                  }}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
            </motion.div>
          )}
          <SubmissionsList
            topics={topics}
            competitionClass={competitionClass}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevStep}
            className="w-[200px]"
          >
            Back
          </Button>
        </CardFooter>
      </div>
    </>
  );
}
