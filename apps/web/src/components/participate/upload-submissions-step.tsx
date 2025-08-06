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
import { combinePhotos } from "@/lib/combine-photos";
import { UploadErrorFallback } from "@/components/participate/upload-error-fallback";
import { UploadSection } from "@/components/participate/upload-section";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useUploadStore } from "@/lib/stores/upload-store";
import { CompetitionClass, Marathon, Topic } from "@vimmer/api/db/types";
import { useRef, useEffect } from "react";
import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants";
import { RULE_KEYS } from "@vimmer/validation/constants";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { useMutation } from "@tanstack/react-query";
import { UploadInstructionsDialog } from "@/components/participate/upload-instructions-dialog";

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
  const t = useI18n();
  const trpc = useTRPC();
  const { domain } = useDomain();
  const {
    submissionState: {
      competitionClassId,
      participantRef,
      participantId,
      uploadInstructionsShown,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const { photos, validateAndAddPhotos } = usePhotoStore();

  const { executeUpload } = useFileUpload();
  const { isUploading, setIsUploading } = useUploadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Temporarily use any to bypass type checking until API is rebuilt
  const { mutateAsync: generatePresignedSubmissions } = useMutation(
    trpc.presignedUrls.generatePresignedSubmissionsOnDemand.mutationOptions(),
    // mutationFn: async (params: {
    //   domain: string;
    //   participantRef: string;
    //   participantId: number;
    //   competitionClassId: number;
    // }) => {
    //   return (
    //     trpc as any
    //   ).presignedUrls.generatePresignedSubmissionsOnDemand.mutate(params);
    // },
  );

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId,
  );

  const handleCloseInstructionsDialog = () => {
    setSubmissionState({ uploadInstructionsShown: true });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.error("No files selected");
      return;
    }
    if (!competitionClass) return;

    const fileArray = Array.from(files);

    const checkedFiles = fileArray.filter(async (file) => {
      try {
        await file.arrayBuffer();
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    });

    if (checkedFiles.length > 0) {
      await validateAndAddPhotos({
        files: checkedFiles,
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
    } else {
      toast.error("No files selected");
      return;
    }
  };

  const handleUploadClick = () => {
    if (!competitionClass) {
      toast.error("Unable to determine class");
      return;
    }
    if (photos.length >= competitionClass.numberOfPhotos) {
      toast.error("Max photos reached");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!domain || !participantRef || !participantId || !competitionClassId) {
      toast.error("Missing required information for upload");
      return;
    }

    try {
      setIsUploading(true);

      // Generate presigned URLs on-demand
      const presignedSubmissions = await generatePresignedSubmissions({
        domain,
        participantRef,
        participantId,
        competitionClassId,
      });

      // Combine photos with fresh presigned URLs
      const combinedPhotos = combinePhotos(photos, presignedSubmissions);

      // Execute upload immediately
      await executeUpload(combinedPhotos);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to generate upload URLs");
      setIsUploading(false);
    }
  };

  if (!competitionClass) {
    return (
      <UploadErrorFallback error={"Unexpected error"} onPrevStep={onPrevStep} />
    );
  }

  return (
    <>
      <UploadInstructionsDialog
        open={!uploadInstructionsShown}
        onClose={handleCloseInstructionsDialog}
      />
      <UploadProgress
        topics={topics}
        expectedCount={competitionClass.numberOfPhotos}
        onComplete={() => onNextStep?.()}
        open={isUploading}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            {t("uploadSubmissions.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("uploadSubmissions.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UploadSection
            marathon={marathon}
            maxPhotos={competitionClass.numberOfPhotos}
            onUpload={handleUpload}
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
            {t("uploadSubmissions.back")}
          </Button>
        </CardFooter>
      </div>
    </>
  );
}
