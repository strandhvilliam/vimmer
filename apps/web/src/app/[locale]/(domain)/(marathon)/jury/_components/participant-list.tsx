"use client";

import { useState, useEffect } from "react";
import { Users, Camera, GitGraph, UserIcon, Star } from "lucide-react";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Input } from "@vimmer/ui/components/input";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { CompleteReviewButton } from "@/components/jury/complete-review-button";
import { Button } from "@vimmer/ui/components/button";
import { useJuryViewedParticipantsStore } from "./use-jury-viewed-participants";
import { useDomain } from "@/contexts/domain-context";

interface ParticipantListProps {
  token: string;
  onParticipantSelect: (participantId: number) => void;
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
      <span className="text-xs text-neutral-500">Viewing all participants</span>
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

export function ParticipantList({
  token,
  onParticipantSelect,
}: ParticipantListProps) {
  const { domain } = useDomain();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const trpc = useTRPC();
  const { viewedRefs, addViewedRefs } = useJuryViewedParticipantsStore();

  const {
    data: { participants, invitation, ratings },
  } = useSuspenseQuery(
    trpc.jury.getParticipants.queryOptions({
      token,
    }),
  );

  const handleParticipantClick = (participantId: number) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;
    addViewedRefs([participant.reference], domain);
    onParticipantSelect(participantId);
  };

  const toggleRatingFilter = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const filteredParticipants = participants.filter((participant) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${participant.firstname || ""} ${participant.lastname || ""}`
          .trim()
          .toLowerCase();
      const reference = participant.reference?.toLowerCase() || "";

      if (!fullName.includes(searchLower) && !reference.includes(searchLower)) {
        return false;
      }
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const rating =
        ratings.find((r) => r.participantId === participant.id)?.rating ?? 0;
      if (!selectedRatings.includes(rating)) {
        return false;
      }
    }

    return true;
  });

  const totalSubmissions = participants.reduce(
    (sum: number, p) => sum + p.submissionCount,
    0,
  );
  const viewedParticipants = viewedRefs.filter((ref) => ref.startsWith(domain));
  const viewedCount = viewedParticipants.length;

  if (participants.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-950">
        <div className="flex w-full border-b items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-4">
            <GitGraph className="w-6 h-6 text-neutral-50" />
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-50 font-rocgrotesk"
              >
                blikka
              </Button>
              <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
                Competition Participants
              </h1>
              <FilterDisplay
                competitionClass={invitation?.competitionClass?.name || null}
                deviceGroup={invitation?.deviceGroup?.name || null}
                topic={invitation?.topic?.name || null}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CompleteReviewButton invitationId={invitation?.id || 0} />
            <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm text-end font-medium text-neutral-50">
                  {invitation?.displayName}
                </span>
                <span className="text-xs text-neutral-400">
                  0 participants to review
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl text-neutral-50 font-semibold mb-4">
              No Participants Found
            </h1>
            <p className="text-neutral-400">
              There are no participants matching the specified criteria.
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
          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-neutral-50 font-rocgrotesk text-2xl font-semibold"
          >
            blikka
          </Button>

          <div className="flex flex-col">
            <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
              Competition Participants
            </h1>
            <FilterDisplay
              competitionClass={invitation?.competitionClass?.name || null}
              deviceGroup={invitation?.deviceGroup?.name || null}
              topic={invitation?.topic?.name || null}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CompleteReviewButton invitationId={invitation?.id || 0} />
          <div className="flex items-center gap-4 bg-neutral-900/50 px-3 py-1.5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-end font-medium text-neutral-50">
                {invitation?.displayName}
              </span>
              <span className="text-xs text-neutral-400">
                {viewedCount} of {participants.length} participants reviewed
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

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Input
            placeholder="Search participants by name or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-neutral-900 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
          />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-neutral-400">Filter by rating:</span>
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={
                  selectedRatings.includes(rating) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleRatingFilter(rating)}
                className={`h-8 px-3 text-xs ${
                  selectedRatings.includes(rating)
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                    : "bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-500"
                }`}
              >
                {rating === 0 ? (
                  "Unrated"
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {rating}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParticipants.map((participant) => {
            const isViewed = viewedParticipants.includes(
              `${domain}-${participant.reference}`,
            );
            const rating =
              ratings.find((r) => r.participantId === participant.id)?.rating ??
              0;
            const fullName =
              `${participant.firstname || ""} ${participant.lastname || ""}`.trim() ||
              "Anonymous";

            return (
              <Card
                key={participant.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isViewed
                    ? "bg-neutral-800/50 border-neutral-600"
                    : "bg-neutral-900 border-neutral-700 hover:border-neutral-500"
                }`}
                onClick={() => handleParticipantClick(participant.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-neutral-50 text-lg font-rocgrotesk">
                        {participant.reference || "No reference"}
                      </h3>
                      <p className="text-sm text-neutral-400">{fullName}</p>
                    </div>
                    <div className="flex items-end flex-col gap-2">
                      {isViewed && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-900/30 text-green-400 border-green-700"
                        >
                          Viewed
                        </Badge>
                      )}
                      <div className="flex w-fit gap-1 items-end">
                        {rating &&
                          [1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-neutral-500"
                              }`}
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm text-neutral-300">
                      {participant.submissionCount} submission
                      {participant.submissionCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {participant.competitionClass && (
                      <Badge
                        variant="outline"
                        className="text-xs border-neutral-600 text-neutral-300"
                      >
                        {participant.competitionClass.name}
                      </Badge>
                    )}
                    {participant.deviceGroup && (
                      <Badge
                        variant="outline"
                        className="text-xs border-neutral-600 text-neutral-300"
                      >
                        {participant.deviceGroup.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredParticipants.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              No participants found
            </h3>
            <p className="text-neutral-500">Try adjusting your search terms</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""} • {totalSubmissions} total
            submission{totalSubmissions !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </main>
  );
}
