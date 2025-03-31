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
} from "@vimmer/ui/components/card";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { SubmissionItem } from "./submission-item";
import { UploadProgress } from "./upload-progress";
import { UploadZone } from "./upload-zone";
import { AlertOctagon } from "lucide-react";

interface Props {
  onPrevStep?: () => void;
  marathonDomain: string;
  competitionClasses: CompetitionClass[];
  topics: Topic[];
}

export function UploadSubmissionsStep({
  marathonDomain,
  onPrevStep,
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

  const { execute: initSubmissions } = useAction(initializeSubmission, {
    onSuccess: (response) => {
      setError(null);
      setPresignedObjects(response.data ?? []);
    },
    onError: ({ error }) => {
      setError(error.serverError ?? "An unexpected error occurred");
    },
  });

  useEffect(() => {
    if (
      !marathonDomain ||
      !competitionClassId ||
      !participantRef ||
      !participantId
    ) {
      return;
    }
    initSubmissions({
      marathonDomain,
      competitionClassId,
      participantRef,
      participantId,
    });
  }, [
    competitionClassId,
    participantRef,
    participantId,
    initSubmissions,
    marathonDomain,
  ]);

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId
  );

  if (!competitionClass) return null;

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 bg-slate-50">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Unable to Prepare Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
            <AlertOctagon className="h-24 w-24 text-destructive" />
            <p className="text-lg text-center text-muted-foreground max-w-md">
              {error}
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
              className="min-w-[200px]"
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
      {isUploading && (
        <UploadProgress
          expectedCount={competitionClass.numberOfPhotos}
          files={combinedPhotos}
          onComplete={() => {
            setIsUploading(false);
            // router.push("/confirmation");
          }}
        />
      )}
      <div className="min-h-screen py-12 px-4 bg-slate-50">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Upload Your Photos</CardTitle>
          </CardHeader>
          <CardContent>
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
                    toast({
                      title: "Invalid file",
                      description: error.message,
                      variant: "destructive",
                    });
                  });
                });
              }}
            />

            <div className="flex flex-col space-y-4">
              {photos.map((photo, index) => (
                <SubmissionItem
                  key={photo.topicId}
                  photo={photo}
                  index={index}
                  onRemove={() => removePhoto(photo.topicId)}
                />
              ))}
              {[...Array(competitionClass.numberOfPhotos - photos.length)].map(
                (_, index) => (
                  <SubmissionItem
                    key={`empty-${index}`}
                    topic={topics[photos.length + index]}
                    index={photos.length + index}
                  />
                )
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col justify-between gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={handleUpload}
              disabled={photos.length === 0}
              className="min-w-[200px]"
            >
              Submit
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onPrevStep}
              className="min-w-[200px]"
            >
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
