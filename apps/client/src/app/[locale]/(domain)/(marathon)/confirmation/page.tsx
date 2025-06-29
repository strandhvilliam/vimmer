import { SearchParams } from "nuqs/server";
import { ConfirmationClient } from "./client-page";
import {
  getParticipantByReference,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import {
  loadSubmissionQueryServerParams,
  submissionQueryServerParamSerializer,
} from "@/lib/schemas/submission-query-server-schema";
import { notFound, redirect } from "next/navigation";
import { ConfirmationData } from "@/lib/types";
import { Resource } from "sst";
import { getDomain } from "@/lib/get-domain";

interface ConfirmationPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const domain = await getDomain();
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) notFound();

  const participant = await getParticipantByReference(
    domain,
    params.participantRef
  );
  const topics = await getTopicsByDomain(domain);

  if (!participant) notFound();

  if (participant.status !== "verified") {
    const redirectParams = submissionQueryServerParamSerializer(params);
    redirect(`/verification${redirectParams}`);
  }

  const submissionsWithTopic = participant.submissions.map((submission) => ({
    ...submission,
    topic: topics.find((topic) => topic.id === submission.topicId),
  }));

  const images: ConfirmationData[] = submissionsWithTopic
    .filter((submission) => submission.status === "uploaded")
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0))
    .map((submission) => ({
      id: submission.id.toString(),
      thumbnailUrl: submission.thumbnailKey
        ? `${Resource.ThumbnailsRouter.url}/${submission.thumbnailKey}`
        : undefined,
      previewUrl: submission.previewKey
        ? `${Resource.PreviewsRouter.url}/${submission.previewKey}`
        : undefined,
      name: submission.topic?.name || `Photo ${submission.id}`,
      orderIndex: submission.topic?.orderIndex ?? 0,
      exif: submission.exif as Record<string, unknown>,
    }));

  return (
    <div className="min-h-[100dvh]">
      <ConfirmationClient images={images} />
    </div>
  );
}
