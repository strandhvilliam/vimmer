import { GitGraph, UserIcon } from "lucide-react";
import { z } from "zod";
import ImageViewer from "./_components/image-viewer";
import InitialView from "./_components/initial-view";
import CompleteReviewButton from "./_components/complete-review-button";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";

import { jwtVerify } from "jose";
import { notFound, redirect } from "next/navigation";
import { getSubmissionsForJury } from "@vimmer/supabase/cached-queries";
import { createClient } from "@vimmer/supabase/server";
import {
  getJuryInvitationByIdQuery,
  getMarathonByDomainQuery,
  getCompetitionClassByIdQuery,
  getTopicByIdQuery,
  getDeviceGroupByIdQuery,
} from "@vimmer/supabase/queries";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  Submission,
  Topic,
} from "@vimmer/api/db/types";
import { Resource } from "sst";

const PREVIEW_BASE_URL = Resource.PreviewsRouter.url;

type TokenPayload = {
  domain: string;
  invitationId: number;
  iat: number;
  exp: number;
};

interface JuryPageProps {
  searchParams: Promise<{ token?: string }>;
}

interface FilterDisplayProps {
  competitionClass: string | null;
  deviceGroup: string | null;
  topic: string | null;
}

function FilterDisplay({
  competitionClass,
  deviceGroup,
  topic,
}: FilterDisplayProps) {
  const hasFilters = competitionClass || deviceGroup || topic;

  if (!hasFilters) {
    return (
      <span className="text-xs text-neutral-500">Viewing all submissions</span>
    );
  }

  const filters = [
    competitionClass && `Class: ${competitionClass}`,
    deviceGroup && `Device: ${deviceGroup}`,
    topic && `Topic: ${topic}`,
  ].filter(Boolean);

  return (
    <span className="text-xs text-neutral-500">
      Viewing: {filters.join(" • ")}
    </span>
  );
}

const tokenPayloadSchema = z.object({
  domain: z.string(),
  invitationId: z.number(),
  iat: z.number(),
  exp: z.number(),
});

async function verifyJuryToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const parsed = tokenPayloadSchema.safeParse(payload);
    if (parsed.success) {
      return parsed.data;
    }
    return null;
  } catch {
    return null;
  }
}

function getPreviewImageUrl(submission: JurySubmission) {
  return submission.previewKey
    ? `${PREVIEW_BASE_URL}/${submission.previewKey}`
    : null;
}

type JurySubmission = Submission & {
  topic: Topic;
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
};

function transformSubmissionsForViewer(submissions: JurySubmission[]) {
  return submissions
    .map((submission) => ({
      id: submission.id.toString(),
      title: submission.topic?.name || `Photo ${submission.id}`,
      artist:
        `${submission.participant?.firstname || ""} ${submission.participant?.lastname || ""}`.trim() ||
        "Anonymous",
      imageUrl: getPreviewImageUrl(submission),
      categories: [
        submission.participant?.competitionClass?.name,
        submission.participant?.deviceGroup?.name,
        submission.topic?.name,
      ].filter(Boolean),
      description: `Submitted by participant ${submission.participant?.reference || "Unknown"} for topic "${submission.topic?.name || "Unknown"}"`,
      submissionDate: new Date(submission.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ),
    }))
    .filter((submission) => submission.imageUrl); // Only include submissions with valid images
}

export default async function Jury({ searchParams }: JuryPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const tokenPayload = await verifyJuryToken(token);

  if (!tokenPayload) {
    notFound();
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenPayload.exp < now) {
    notFound();
  }

  const supabase = await createClient();
  const invitation = await getJuryInvitationByIdQuery(
    supabase,
    tokenPayload.invitationId
  );

  if (!invitation) {
    notFound();
  }

  const marathon = await getMarathonByDomainQuery(
    supabase,
    tokenPayload.domain
  );
  if (!marathon || invitation.marathonId !== marathon.id) {
    notFound();
  }

  const invitationExpiry = new Date(invitation.expiresAt);
  if (invitationExpiry < new Date()) {
    notFound();
  }

  const [competitionClass, deviceGroup, topic] = await Promise.all([
    invitation.competitionClassId
      ? getCompetitionClassByIdQuery(supabase, invitation.competitionClassId)
      : null,
    invitation.deviceGroupId
      ? getDeviceGroupByIdQuery(supabase, invitation.deviceGroupId)
      : null,
    invitation.topicId ? getTopicByIdQuery(supabase, invitation.topicId) : null,
  ]);

  const rawSubmissions = await getSubmissionsForJury({
    domain: tokenPayload.domain,
    competitionClassId: invitation.competitionClassId,
    deviceGroupId: invitation.deviceGroupId,
    topicId: invitation.topicId,
  });

  const submissions = transformSubmissionsForViewer(rawSubmissions);

  const juryContent = () => {
    if (submissions.length === 0) {
      return (
        <main className="min-h-screen bg-neutral-950">
          <div className="flex w-full border-b items-center h-16 px-4 justify-between">
            <div className="flex items-center gap-4">
              <GitGraph className=" w-6 h-6 text-neutral-50" />
              <div className="flex flex-col">
                <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
                  Competition Submissions
                </h1>
                <FilterDisplay
                  competitionClass={competitionClass?.name || null}
                  deviceGroup={deviceGroup?.name || null}
                  topic={topic?.name || null}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CompleteReviewButton invitationId={invitation.id} />
              <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-sm text-end font-medium text-neutral-50">
                    {invitation.displayName}
                  </span>
                  <span className="text-xs text-neutral-400">
                    0 submissions to review
                  </span>
                </div>
                <Avatar className="h-8 w-8 backdrop-blur-md">
                  <AvatarFallback>
                    <UserIcon className=" h-4 w-4 text-neutral-800" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl text-neutral-50 font-semibold mb-4">
                No Submissions Found
              </h1>
              <p className="text-neutral-400">
                There are no submissions matching the specified criteria.
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-neutral-950">
        <div className="flex w-full border-b items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-4">
            <GitGraph className=" w-6 h-6 text-neutral-50" />
            <div className="flex flex-col">
              <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
                Competition Submissions
              </h1>
              <FilterDisplay
                competitionClass={competitionClass?.name || null}
                deviceGroup={deviceGroup?.name || null}
                topic={topic?.name || null}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CompleteReviewButton invitationId={invitation.id} />
            <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm text-end font-medium text-neutral-50">
                  {invitation.displayName}
                </span>
                <span className="text-xs text-neutral-400">
                  {submissions.length} submissions to review
                </span>
              </div>
              <Avatar className="h-8 w-8 backdrop-blur-md">
                <AvatarFallback>
                  <UserIcon className=" h-4 w-4 text-neutral-800" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        <ImageViewer submissions={submissions} />
      </main>
    );
  };

  return <InitialView invitation={invitation}>{juryContent()}</InitialView>;
}
