"use client";

import { ParticipantHeader } from "@/components/admin/participant-header";
import { PhotoSubmissionCard } from "@/components/admin/submission-card";
import { ParticipantValidationResultsTable } from "@/components/admin/participant-validation-results-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

interface ParticipantSubmissionClientPageProps {
  participantRef: string;
  baseUrl: string;
}

export function ParticipantSubmissionClientPage({
  participantRef,
  baseUrl,
}: ParticipantSubmissionClientPageProps) {
  const { domain } = useDomain();
  const trpc = useTRPC();

  const { data: participant } = useSuspenseQuery(
    trpc.participants.getByReference.queryOptions({
      reference: participantRef,
      domain,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const data = participant?.submissions
    .map((s) => ({
      submission: s,
      topic: topics.find((t) => t.id === s.topicId),
    }))
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0));

  const validationResults = participant?.validationResults || [];

  if (!data || !participant) {
    return <div>Participant not found</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <ParticipantHeader
        participant={participant}
        validationResults={validationResults}
      />

      <Tabs defaultValue="submissions">
        <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
          <TabsTrigger
            value="submissions"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            Submissions
          </TabsTrigger>
          <TabsTrigger
            value="validation"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            Validation Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map(({ submission, topic }) => (
              <PhotoSubmissionCard
                imageUrl={
                  submission.thumbnailKey
                    ? `${baseUrl}/${submission.thumbnailKey}`
                    : null
                }
                key={submission.id}
                submission={submission}
                topic={topic}
                validationResults={validationResults}
              />
            ))}
            {data.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No photos submitted yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <ParticipantValidationResultsTable
            validationResults={validationResults}
            topics={topics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
