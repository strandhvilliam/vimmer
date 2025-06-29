import { notFound } from "next/navigation";
import { ParticipantHeader } from "./_components/participant-header";
import {
  getParticipantByReference,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { PhotoSubmissionCard } from "./_components/submission-card";
import { ValidationResultsTable } from "./_components/validation-results-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { Resource } from "sst";

interface PageProps {
  params: Promise<{
    domain: string;
    participantRef: string;
  }>;
}

export default async function ParticipantSubmissionPage({ params }: PageProps) {
  const { domain, participantRef } = await params;
  const [participant, topics] = await Promise.all([
    getParticipantByReference(domain, participantRef),
    getTopicsByDomain(domain),
  ]);

  if (!participant) {
    notFound();
  }

  const data = participant.submissions
    .map((s) => ({
      submission: s,
      topic: topics.find((t) => t.id === s.topicId),
    }))
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0));

  const validationResults = participant.validationResults || [];

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
                imageUrl={`${Resource.ThumbnailsRouter.url}/${submission.thumbnailKey}`}
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
          <ValidationResultsTable validationResults={validationResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
