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
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useDomain } from "@/contexts/domain-context";
import { useRef } from "react";
import { ValidationResultStateBadge } from "./validation-result-state-badge";
import { useReplacePhoto } from "@/hooks/use-replace-photo";

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

  const { replacePhoto, isUploading } = useReplacePhoto({
    onSuccess: () => {
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
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      replacePhoto(file, submission.id, domain);
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
