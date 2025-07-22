"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import { UploadProgress } from "@/components/participate/upload-progress";
import { StepNavigationHandlers } from "@/lib/types";
import { usePhotoStore } from "@/lib/stores/photo-store";
import { RuleKey, RuleConfig } from "@vimmer/validation/types";
import { SubmissionsList } from "@/components/participate/submission-list";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { usePresignedSubmissions } from "@/hooks/use-presigned-submissions";
import { combinePhotos } from "@/lib/combine-photos";
import { UploadErrorFallback } from "@/components/participate/upload-error-fallback";
import { UploadSection } from "@/components/participate/upload-section";
import { useFileUpload } from "@/hooks/use-file-upload";
import { CompetitionClass, Marathon, Topic } from "@vimmer/api/db/types";
import { useRef, useState } from "react";
import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { toast } from "sonner";

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
  topics: Topic[];
  ruleConfigs: RuleConfig<RuleKey>[];
  marathon: Marathon;
}

export function UploadSubmissionsStep({
  onPrevStep,
  onNextStep,
  topics,
  marathon,
  competitionClasses,
  ruleConfigs,
}: Props) {
  const {
    submissionState: { competitionClassId },
  } = useSubmissionQueryState();

  const [isUploadProgressOpen, setIsUploadProgressOpen] = useState(false);

  const { photos, validateAndAddPhotos } = usePhotoStore();
  const { data: presignedSubmissions = [] } = usePresignedSubmissions();

  const {
    isUploading,
    fileStates,
    executeUpload,
    retryFailedUploads,
    retrySingleFile,
  } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const combinedPhotos = combinePhotos(photos, presignedSubmissions);

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId,
  );

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!competitionClass) return;

    const fileArray = Array.from(files);

    const invalidFiles = fileArray.filter((file) => {
      const fileExtension = file.name?.split(".").pop()?.trim()?.toLowerCase();
      return !fileExtension || !COMMON_IMAGE_EXTENSIONS.includes(fileExtension);
    });

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((file) => {
        const fileExtension = file.name
          ?.split(".")
          .pop()
          ?.trim()
          ?.toLowerCase();
        toast.error(
          `Invalid file type: ${fileExtension ?? "NO FILE EXTENSION"}`,
        );
      });
      return;
    }

    validateAndAddPhotos({
      files: fileArray,
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
      maxPhotos: competitionClass.numberOfPhotos,
    });
  };

  const handleUploadClick = () => {
    if (!competitionClass) {
      toast.error("Unable to determine class");
      return;
    }
    if (photos.length >= competitionClass.numberOfPhotos) {
      toast.error("Maximum number of photos reached");
      return;
    }
    fileInputRef.current?.click();
  };

  // useEffect(() => {
  //   if (participantIsCompleted) {
  //     setIsUploadProgressOpen(false);
  //     onNextStep?.();
  //   }
  // }, [participantIsCompleted]);

  if (!competitionClass) {
    return (
      <UploadErrorFallback
        error={"An unexpected error occurred"}
        onPrevStep={onPrevStep}
      />
    );
  }

  return (
    <>
      <UploadProgress
        topics={topics}
        expectedCount={competitionClass.numberOfPhotos}
        files={combinedPhotos}
        fileStates={fileStates}
        onComplete={() => onNextStep?.()}
        onRetryFailed={retryFailedUploads}
        isUploading={isUploading}
        open={isUploadProgressOpen}
        onRetrySingle={retrySingleFile}
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
          <UploadSection
            marathon={marathon}
            maxPhotos={competitionClass.numberOfPhotos}
            onUpload={() => {
              setIsUploadProgressOpen(true);
              executeUpload(combinedPhotos);
            }}
            ruleConfigs={ruleConfigs}
            topics={topics}
          />
          <SubmissionsList
            topics={topics}
            competitionClass={competitionClass}
            onUploadClick={handleUploadClick}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={COMMON_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
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
