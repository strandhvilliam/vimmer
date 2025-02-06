"use client";

import { CompetitionClass, Topic } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { useToast } from "@vimmer/ui/hooks/use-toast";
import { createRule, SubmissionValidator } from "@vimmer/utils/validator";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { SubmissionItem } from "./submission-item";
import { UploadProgress } from "./upload-progress";
import { UploadZone } from "./upload-zone";

export interface SelectedPhoto {
  id: string;
  file: File;
  preview: string;
  topicId: number;
  topicName: string;
  isValid?: boolean;
  validationMessage?: string;
}
interface Props {
  onPrevStep?: () => void;
  competitionClasses: CompetitionClass[];
  topics: Topic[];
}

export function UploadSubmissions({
  onPrevStep,
  topics,
  competitionClasses,
}: Props) {
  const [ccId] = useQueryState("cc", parseAsInteger);

  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const competitionClass = competitionClasses.find((cc) => cc.id === ccId);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!competitionClass) {
      return;
    }

    const remainingSlots = competitionClass.numberOfPhotos - photos.length;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    const newPhotos = filesToProcess.map((file, index) => {
      const topicIndex = photos.length + index;
      const topic = topics[topicIndex];

      return {
        id: `${file.name}-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        topicId: topic!.id,
        topicName: topic!.name,
      };
    });

    const toValidate = [...photos, ...newPhotos];

    const validator = new SubmissionValidator([
      createRule({
        key: "allowed_file_types",
        level: "error",
        params: { extensions: ["jpg"], mimeTypes: ["image/jpeg"] },
      }),
      createRule({
        key: "same_device",
        level: "error",
        params: {},
      }),
    ]);
    const validation = await validator.validate(
      toValidate.map((photo) => photo.file),
    );

    const finalPhotos = toValidate.map((photo) => {
      const result = validation.find((r) =>
        r.invalidFiles.includes(photo.file.name),
      );
      if (result) {
        return {
          ...photo,
          isValid: false,
          validationMessage: result.message,
        };
      }
      return {
        ...photo,
        isValid: true,
        validationMessage: undefined,
      };
    });

    setPhotos(finalPhotos);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      const remainingPhotos = prev.filter((photo) => photo.id !== id);
      return remainingPhotos.map((photo, index) => ({
        ...photo,
        topicId: topics[index]!.id,
        topicName: topics[index]!.name,
      }));
    });
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      // Implement your upload logic here
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (!competitionClass) {
    return null;
  }

  return (
    <>
      {isUploading && (
        <UploadProgress
          files={photos.map((photo) => ({
            id: photo.id,
            name: photo.file.name,
          }))}
          onComplete={() => {
            setIsUploading(false);
            router.push("/confirmation");
          }}
          onError={(error) => {
            setIsUploading(false);
            toast({
              title: "Upload failed",
              description: error.message,
              variant: "destructive",
            });
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
              onDrop={onDrop}
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
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onRemove={removePhoto}
                />
              ))}
              {[...Array(competitionClass.numberOfPhotos - photos.length)].map(
                (_, index) => (
                  <SubmissionItem
                    key={`empty-${index}`}
                    topic={topics[photos.length + index]}
                    index={photos.length + index}
                  />
                ),
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col justify-between gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={handleSubmit}
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
