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
import { Participant } from "@vimmer/api/db/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { Button } from "@vimmer/ui/components/button";
import { PARTICIPANT_STATUS } from "@vimmer/supabase/types";
import { useState } from "react";
import { runSheetGenerationQueue } from "@/lib/actions/run-sheet-generation-queue";
import { Download } from "lucide-react";

interface ParticipantSubmissionClientPageProps {
  variantsGeneratorUrl: string;
  participantRef: string;
  thumbnailBaseUrl: string;
  submissionsBaseUrl: string;
  contactSheetBucketUrl: string;
}

export function ParticipantSubmissionClientPage({
  variantsGeneratorUrl,
  participantRef,
  thumbnailBaseUrl,
  submissionsBaseUrl,
  contactSheetBucketUrl,
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
        variantsGeneratorUrl={variantsGeneratorUrl}
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
          <TabsTrigger
            value="contact-sheet"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            Contact Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map(({ submission, topic }) => (
              <PhotoSubmissionCard
                imageUrl={
                  submission.thumbnailKey
                    ? `${thumbnailBaseUrl}/${submission.thumbnailKey}`
                    : submission.key
                      ? `${submissionsBaseUrl}/${submission.key}`
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

        <TabsContent value="contact-sheet" className="mt-6">
          <ContactSheetTab
            participant={participant}
            domain={domain}
            submissionsBaseUrl={submissionsBaseUrl}
            contactSheetBucketUrl={contactSheetBucketUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ContactSheetTabProps {
  participant: Participant;
  domain: string;
  submissionsBaseUrl: string;
  contactSheetBucketUrl: string;
}

function ContactSheetTab({
  participant,
  domain,
  submissionsBaseUrl,
  contactSheetBucketUrl,
}: ContactSheetTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const hasContactSheet = !!participant.contactSheetKey;
  const canGenerate =
    participant.status === PARTICIPANT_STATUS.COMPLETED ||
    participant.status === PARTICIPANT_STATUS.VERIFIED;

  const handleGenerateContactSheet = async () => {
    setIsGenerating(true);
    try {
      await runSheetGenerationQueue({
        participantRef: participant.reference,
        domain,
      });
    } catch (error) {
      console.error("Failed to generate contact sheet:", error);
    }
  };

  const handleDownloadContactSheet = () => {
    const link = document.createElement("a");
    link.href = `${contactSheetBucketUrl}/${participant.contactSheetKey}`;
    link.download = `contact-sheet-${participant.reference}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log(participant.contactSheetKey);

  if (hasContactSheet) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <img
            src={`${contactSheetBucketUrl}/${participant.contactSheetKey}`}
            alt="Contact Sheet"
            className="max-w-full h-auto border border-black shadow-lg"
          />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleDownloadContactSheet} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Contact Sheet
          </Button>
        </div>
      </div>
    );
  }

  if (canGenerate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">No contact sheet available</p>
        <Button onClick={handleGenerateContactSheet} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Contact Sheet"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Nothing to show here</p>
    </div>
  );
}
