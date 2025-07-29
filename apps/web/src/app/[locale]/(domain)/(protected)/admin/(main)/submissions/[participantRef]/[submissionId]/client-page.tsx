"use client";

import { notFound } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { SubmissionPreviewCard } from "@/components/admin/submission-preview-card";
import { SubmissionValidationSteps } from "@/components/admin/submission-validation-steps";
import { SubmissionExifDataDisplay } from "@/components/admin/submission-exif-data-display";
import { SubmissionDetails } from "@/components/admin/submission-details";
import { SubmissionHeader } from "@/components/admin/submission-header";
import { useDomain } from "@/contexts/domain-context";

interface SubmissionDetailClientProps {
  previewBaseUrl: string;
  submissionBaseUrl: string;
  participantRef: string;
  submissionId: string;
}

export function SubmissionDetailClient({
  previewBaseUrl,
  submissionBaseUrl,
  participantRef,
  submissionId,
}: SubmissionDetailClientProps) {
  const { domain } = useDomain();
  const trpc = useTRPC();

  const { data: participant } = useSuspenseQuery(
    trpc.participants.getByReference.queryOptions({
      domain,
      reference: participantRef,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const submission = participant?.submissions.find(
    (s) => s.id === parseInt(submissionId),
  );
  const topic = topics.find((t) => t.id === submission?.topicId);

  if (!submission || !topic || !participant) {
    notFound();
  }

  const submissionValidationResults =
    participant?.validationResults?.filter(
      (result) => result.fileName && result.fileName.includes(submission.key),
    ) || [];

  const hasIssues = submissionValidationResults.some(
    (result) => result.outcome === "failed",
  );

  return (
    <>
      <SubmissionHeader
        submission={submission}
        participant={participant}
        topic={topic}
        validationResults={submissionValidationResults}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div>
          <Tabs defaultValue="details" className="">
            <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
              <TabsTrigger
                value="details"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Details & Timeline
              </TabsTrigger>
              <TabsTrigger
                value="validation"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Validation Results
              </TabsTrigger>
              <TabsTrigger
                value="exif"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                EXIF Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <SubmissionDetails
                submission={submission}
                topic={topic}
                participant={participant}
                hasIssues={hasIssues}
              />
            </TabsContent>

            <TabsContent value="validation" className="mt-4">
              <SubmissionValidationSteps
                validationResults={submissionValidationResults}
              />
            </TabsContent>

            <TabsContent value="exif" className="mt-4 space-y-4">
              <SubmissionExifDataDisplay exifData={submission.exif} />
            </TabsContent>
          </Tabs>
        </div>
        <SubmissionPreviewCard
          competitionClass={participant.competitionClass}
          topic={topic}
          imageUrl={
            submission.previewKey
              ? `${previewBaseUrl}/${submission.previewKey}`
              : submission.key
                ? `${submissionBaseUrl}/${submission.key}`
                : null
          }
        />
      </div>
    </>
  );
}
