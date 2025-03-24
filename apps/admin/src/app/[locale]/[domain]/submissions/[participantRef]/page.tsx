import { notFound } from "next/navigation";
import { ParticipantHeader } from "./_components/participant-header";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { PhotoSubmissionCard } from "./_components/submission-card";

interface PageProps {
  params: Promise<{
    domain: string;
    participantRef: string;
  }>;
}

export default async function ParticipantSubmissionPage({ params }: PageProps) {
  const { domain, participantRef } = await params;
  const participant = await getParticipantByReference(domain, participantRef);

  if (!participant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <ParticipantHeader participant={participant} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {participant.submissions.map((submission) => (
          <PhotoSubmissionCard key={submission.id} submission={submission} />
        ))}
        {participant.submissions.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No photos submitted yet
          </div>
        )}
      </div>
    </div>
  );
}
