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

  if (!params.participantRef) notFound();

  const participant = await getParticipantByReference(
    domain,
    params.participantRef
  );

  if (!participant) notFound();

  if (participant.status !== "verified") {
    const redirectParams = submissionQueryServerParamSerializer(params);
    redirect(`/verification${redirectParams}`);
  }

  const images = participant.submissions
    .filter((submission) => submission.status === "uploaded")
    .sort((a, b) => a.topic.orderIndex - b.topic.orderIndex)
    .map((submission) => ({
      id: submission.id.toString(),
      url: submission.thumbnailKey
        ? `${Resource.ThumbnailsRouter.url}/${submission.thumbnailKey}`
        : undefined,
      previewUrl: submission.previewKey
        ? `${Resource.PreviewsRouter.url}/${submission.previewKey}`
        : undefined,
      name: submission.topic.name || `Photo ${submission.id}`,
      orderIndex: submission.topic.orderIndex,
      exif: submission.exif as Record<string, unknown>,
    }));

  return (
    <div className="min-h-[100dvh]">
      <ConfirmationClient images={images} />
    </div>
  );
}
