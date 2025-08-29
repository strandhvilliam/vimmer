"use client";

import { Button } from "@vimmer/ui/components/button";
import { Badge } from "@vimmer/ui/components/badge";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { UserIcon } from "lucide-react";
import { CompleteReviewButton } from "@/components/jury/complete-review-button";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { JuryInvitation } from "@vimmer/api/db/types";

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
      <span className="text-xs text-neutral-500">Viewing all participants</span>
    );
  }

  const filters = [
    competitionClass && `Class: ${competitionClass}`,
    deviceGroup && `Device: ${deviceGroup}`,
    topic && `Topic: ${topic}`,
  ].filter(Boolean);

  return (
    <span className="text-xs text-neutral-500">{filters.join(" • ")}</span>
  );
}

interface JuryHeaderProps {
  viewedCount: number;
  token: string;
}

export function JuryHeader({ viewedCount, token }: JuryHeaderProps) {
  const trpc = useTRPC();

  const { data: totalParticipants } = useSuspenseQuery(
    trpc.jury.getJuryParticipantCount.queryOptions({
      token,
    }),
  );

  const { data: invitation } = useSuspenseQuery(
    trpc.jury.verifyTokenAndGetInitialData.queryOptions({
      token,
    }),
  );

  return (
    <div className="flex w-full border-b items-center h-16 px-4 justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-neutral-400 hover:text-neutral-50 font-rocgrotesk text-2xl font-semibold"
        >
          blikka
        </Button>

        <div className="flex flex-col">
          <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
            Jury Review
          </h1>
          <FilterDisplay
            competitionClass={invitation?.competitionClass?.name || null}
            deviceGroup={invitation?.deviceGroup?.name || null}
            topic={invitation?.topic?.name || null}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <CompleteReviewButton
          token={token}
          invitationId={invitation?.id || 0}
        />
        <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm text-end font-medium text-neutral-50">
              {invitation?.displayName}
            </span>
            <span className="text-xs text-neutral-400">
              {viewedCount} of {totalParticipants?.value} participants rated
            </span>
          </div>
          <Avatar className="h-8 w-8 backdrop-blur-md">
            <AvatarFallback>
              <UserIcon className="h-4 w-4 text-neutral-800" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

export function JuryHeaderSkeleton() {
  return (
    <div className="flex w-full border-b items-center h-16 px-4 justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-6 bg-neutral-800 rounded animate-pulse" />
        <div className="flex flex-col">
          <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mb-1" />
          <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-8 bg-neutral-800 rounded animate-pulse" />
        <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
          <div className="flex flex-col">
            <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 bg-neutral-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
