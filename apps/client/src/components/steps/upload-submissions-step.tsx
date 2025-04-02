"use client";

import {
  initializeSubmission,
  PresignedObject,
} from "@/lib/actions/initialize-submission";
import { usePhotoManagement } from "@/lib/hooks/use-photo-management";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { useUploadManagement } from "@/lib/hooks/use-upload-management";
import { CompetitionClass, Topic } from "@vimmer/supabase/types";
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
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { AlertOctagon, ArrowRight, CloudUpload, Loader2 } from "lucide-react";
import { SubmissionItem } from "../submission-item";
import { UploadZone } from "../upload-zone";
import { UploadProgress } from "../upload-progress";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { motion } from "framer-motion";
import { StepNavigationHandlers } from "@/lib/types";
import { cn } from "@vimmer/ui/lib/utils";

interface Props extends StepNavigationHandlers {
  domain: string;
  competitionClasses: CompetitionClass[];
  topics: Topic[];
}

export function UploadSubmissionsStep({
  domain,
  onPrevStep,
  onNextStep,
  topics,
  competitionClasses,
}: Props) {
  const {
    submissionState: { competitionClassId, participantRef, participantId },
  } = useSubmissionQueryState();

  const { photos, removePhoto, validateAndAddPhotos } = usePhotoManagement({
    topics,
  });

  const [presignedObjects, setPresignedObjects] = useState<PresignedObject[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const { isUploading, setIsUploading, handleUpload, combinedPhotos } =
    useUploadManagement({
      photos,
      presignedObjects,
    });

  const { execute: initializeSubmissionAction, isPending: isInitializing } =
    useAction(initializeSubmission, {
      onSuccess: (response) => {
        if (!response.data) {
          setError("An unexpected error occurred");
          return;
        }
        setError(null);
        setPresignedObjects(response.data);
      },
      onError: ({ error }) => {
        setError(error.serverError ?? "An unexpected error occurred");
      },
    });

  useEffect(() => {
    if (!competitionClassId || !participantRef || !participantId) return;

    initializeSubmissionAction({
      domain,
      competitionClassId,
      participantRef,
      participantId,
    });
  }, [
    competitionClassId,
    participantRef,
    participantId,
    initializeSubmissionAction,
    domain,
  ]);

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId
  );

  const allPhotosSelected =
    photos.length === competitionClass?.numberOfPhotos &&
    photos.length > 0 &&
    !isInitializing;

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
              {error ?? "An unexpected error occurred"}
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
                    disabled={isInitializing}
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
              {presignedObjects.length > 0 ? (
                <UploadZone
                  onDrop={(acceptedFiles) =>
                    validateAndAddPhotos(
                      acceptedFiles,
                      photos.length,
                      competitionClass.numberOfPhotos
                    )
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

          <div className="flex flex-col space-y-2">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.topicId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <SubmissionItem
                  photo={photo}
                  index={index}
                  onRemove={() => removePhoto(photo.topicId)}
                />
              </motion.div>
            ))}
            {[...Array(competitionClass.numberOfPhotos - photos.length)].map(
              (_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: (photos.length + index) * 0.1,
                  }}
                >
                  <SubmissionItem
                    topic={topics[photos.length + index]}
                    index={photos.length + index}
                  />
                </motion.div>
              )
            )}
          </div>
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
