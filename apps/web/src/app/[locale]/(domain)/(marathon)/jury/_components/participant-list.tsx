"use client";

import { useEffect, useRef } from "react";
import { Users, Star, Loader2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { useJuryViewedParticipantsStore } from "./use-jury-viewed-participants";
import { ParticipantCard } from "./participant-card";
import { Submission, Topic } from "@vimmer/api/db/types";

interface Participant {
  id: number;
  reference: string;
  competitionClass?: { name: string; numberOfPhotos: number } | null;
  deviceGroup?: { name: string } | null;
  submission?: Submission & {
    topic: Topic | null;
  };
}

interface PageData {
  participants?: Participant[];
  nextCursor?: number | null | undefined;
}

interface ParticipantListProps {
  data: { pages: PageData[] } | undefined;
  ratings: { participantId: number; rating: number }[];
  selectedRatings: number[];
  toggleRatingFilter: (rating: number) => void;
  onParticipantSelect: (participantId: number, reference: string) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  totalParticipants: { value: number } | undefined;
  domain: string;
  token: string;
  thumbnailsUrl: string;
}

export function ParticipantList({
  data,
  ratings,
  selectedRatings,
  toggleRatingFilter,
  onParticipantSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  error,
  totalParticipants,
  thumbnailsUrl,
  domain,
  token,
}: ParticipantListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleParticipantClick = (participantId: number, reference: string) => {
    onParticipantSelect(participantId, reference);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        {/* <Input
            placeholder="Search participants by name or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-neutral-900 border-neutral-700 text-neutral-50 placeholder:text-neutral-400"
          /> */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">
            Total participants: {totalParticipants?.value}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-neutral-400">Filter by rating:</span>
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant={selectedRatings.includes(rating) ? "default" : "outline"}
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
        {data?.pages.map((page: PageData) => {
          return page.participants?.map((participant: Participant) => {
            const rating =
              ratings.find(
                (r: { participantId: number; rating: number }) =>
                  r.participantId === participant.id,
              )?.rating ?? 0;

            return (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                rating={rating}
                onClick={() =>
                  handleParticipantClick(participant.id, participant.reference)
                }
                thumbnailUrl={`${thumbnailsUrl}/${participant.submission?.thumbnailKey}`}
              />
            );
          });
        })}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more participants...</span>
            </div>
          ) : (
            <div className="h-8" /> // Invisible trigger area
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && data?.pages.length && (
        <div className="text-center py-8">
          <div className="text-sm text-neutral-500">
            You&apos;ve reached the end of the list
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-300 mb-2">
            Error loading participants
          </h3>
          <p className="text-red-500 mb-4">
            {error.message || "An error occurred while loading participants"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-600 text-red-300 hover:bg-red-900/20"
          >
            Retry
          </Button>
        </div>
      )}

      {!error &&
        data?.pages.every((page: PageData) => !page.participants?.length) && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-300 mb-2">
              No participants found
            </h3>
            <p className="text-neutral-500">
              {selectedRatings.length > 0
                ? "Try adjusting your rating filters"
                : "No participants match your criteria"}
            </p>
          </div>
        )}

      {!error && (
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            {data?.pages.reduce(
              (total: number, page: PageData) =>
                total + (page.participants?.length || 0),
              0,
            ) || 0}{" "}
            participant
            {(data?.pages.reduce(
              (total: number, page: PageData) =>
                total + (page.participants?.length || 0),
              0,
            ) || 0) !== 1
              ? "s"
              : ""}{" "}
            loaded • {totalParticipants?.value} total participant
            {totalParticipants?.value !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
