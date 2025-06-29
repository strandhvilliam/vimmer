"use client";

import { CompetitionClass, Topic } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import { UploadProgress } from "@/components/upload-progress";
import { StepNavigationHandlers } from "@/lib/types";
import { usePhotoStore } from "@/lib/stores/photo-store";
import { RuleKey, RuleConfig } from "@vimmer/validation/types";
import { SubmissionsList } from "@/components/submission-list";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { usePresignedSubmissions } from "@/hooks/use-presigned-submissions";
import { combinePhotos } from "@/lib/combine-photos";
import UploadErrorFallback from "@/components/upload-error-fallback";
import UploadSection from "@/components/upload-section";
import { useFileUpload } from "@/hooks/use-file-upload";

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
  topics: Topic[];
  ruleConfigs: RuleConfig<RuleKey>[];
}

export function UploadSubmissionsStep({
  onPrevStep,
  onNextStep,
  topics,
  competitionClasses,
  ruleConfigs,
}: Props) {
  const {
    submissionState: { competitionClassId },
  } = useSubmissionQueryState();

  const { photos } = usePhotoStore();
  const { data: presignedSubmissions = [] } = usePresignedSubmissions();

  const { isUploading, executeUpload } = useFileUpload();

  const combinedPhotos = combinePhotos(photos, presignedSubmissions);

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId
  );

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
        onComplete={() => onNextStep?.()}
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
          <UploadSection
            maxPhotos={competitionClass.numberOfPhotos}
            onUpload={() => executeUpload(combinedPhotos)}
            ruleConfigs={ruleConfigs}
            topics={topics}
          />
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
