import { SearchParams } from "nuqs/server";
import { ConfirmationClient } from "./client-page";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import {
  loadSubmissionQueryServerParams,
  submissionQueryServerParamSerializer,
} from "@/lib/schemas/submission-query-server-schema";
import { notFound, redirect } from "next/navigation";
import { Resource } from "sst";

interface ConfirmationPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const domain = "dev0";
  const params = await loadSubmissionQueryServerParams(searchParams);

  if (!params.participantRef) {
    notFound();
  }
  const participant = await getParticipantByReference(
    domain,
    params.participantRef
  );

  if (!participant) notFound();

  if (participant.status !== "verified") {
    const redirectParams = submissionQueryServerParamSerializer(params);
    redirect(`/verification${redirectParams}`);
  }

  // Get CloudFront URL from SST resources
  const cloudfrontUrl = Resource.VimmerBucketRouter.url;

  // Map submissions to the format expected by the client
  // Only include necessary information, not personal data
  const images = participant.submissions
    .filter(
      (submission) =>
        submission.status === "uploaded" && submission.thumbnailKey
    )
    .map((submission) => ({
      id: submission.id.toString(),
      url: `${cloudfrontUrl}/${submission.thumbnailKey}`,
      previewUrl: submission.previewKey
        ? `${cloudfrontUrl}/${submission.previewKey}`
        : undefined,
      name: submission.topic?.name || `Photo ${submission.id}`,
      topicId: submission.topicId,
    }));

  return <ConfirmationClient images={images} />;
}
