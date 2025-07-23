"use client";

import { ArrowLeft, ReplaceIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@vimmer/ui/components/button";
import {
  Submission,
  Participant,
  Topic,
  ValidationResult,
} from "@vimmer/api/db/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useDomain } from "@/contexts/domain-context";
import { useRef, useState } from "react";
import { resizeImage } from "@/lib/image-resize";
import { ValidationResultStateBadge } from "./validation-result-state-badge";

interface SubmissionHeaderProps {
  submission: Submission;
  participant: Participant;
  topic: Topic;
  validationResults: ValidationResult[];
}

export function SubmissionHeader({
  submission,
  participant,
  topic,
  validationResults,
}: SubmissionHeaderProps) {
  const queryClient = useQueryClient();
  const { participantRef } = useParams<{ participantRef: string }>();
  const { domain } = useDomain();

  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: getReplacementPresignedUrl } = useMutation(
    trpc.presignedUrls.generateReplacementPresignedUrl.mutationOptions(),
  );

  const { mutate: updateSubmissionAfterUpload } = useMutation(
    trpc.submissions.replacePhoto.mutationOptions({
      onSuccess: () => {
        toast.success("Photo replaced successfully");

        queryClient.invalidateQueries({
          queryKey: trpc.submissions.getById.queryKey({
            id: Number(submission.id),
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.participants.getByReference.queryKey({
            reference: participantRef,
            domain,
          }),
        });
      },
      onError: (error) => {
        console.error("Failed to update submission:", error);
        toast.error("Failed to replace photo");
      },
      onSettled: () => {
        setIsUploading(false);
      },
    }),
  );
  const handleReplacePhoto = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const presignedData = await getReplacementPresignedUrl({
        submissionId: submission.id,
        domain,
      });

      const [thumbnailResized, previewResized] = await Promise.all([
        resizeImage(file, { width: presignedData.thumbnail.width }),
        resizeImage(file, { width: presignedData.preview.width }),
      ]);

      const uploadPromises = [
        fetch(presignedData.original.presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        }),
        fetch(presignedData.thumbnail.presignedUrl, {
          method: "PUT",
          body: thumbnailResized.blob,
          headers: { "Content-Type": file.type },
        }),
        fetch(presignedData.preview.presignedUrl, {
          method: "PUT",
          body: previewResized.blob,
          headers: { "Content-Type": file.type },
        }),
      ];

      const responses = await Promise.all(uploadPromises);

      const failedUploads = responses.filter((response) => !response.ok);
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} file(s)`);
      }

      updateSubmissionAfterUpload({
        submissionId: submission.id,
        originalKey: presignedData.original.key,
        thumbnailKey: presignedData.thumbnail.key,
        previewKey: presignedData.preview.key,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error) {
      console.error("Failed to replace photo:", error);
      toast.error("Failed to replace photo");
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleReplacePhoto(file);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={`/admin/submissions/${participant.reference}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
              #{topic.orderIndex + 1} {topic.name}
            </h1>
            <ValidationResultStateBadge validationResults={validationResults} />
          </div>
          <span className="text-sm text-muted-foreground">
            Participant #{participant.reference}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={isUploading}
        >
          <ReplaceIcon className="h-4 w-4 mr-2" />
          Replace Submission
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
