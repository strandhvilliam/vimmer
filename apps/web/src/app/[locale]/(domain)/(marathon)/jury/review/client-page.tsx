"use client";

import { Suspense } from "react";
import { ParticipantList } from "../_components/participant-list";
import { ParticipantListLoading } from "../_components/participant-loading";
import { SubmissionViewer } from "../_components/submission-viewer";
import { JuryHeader, JuryHeaderSkeleton } from "../_components/jury-header";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useJuryViewedParticipantsStore } from "../_components/use-jury-viewed-participants";
import { useDomain } from "@/contexts/domain-context";
import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";

interface ReviewClientPageProps {
  token: string;
  previewBaseUrl: string;
  submissionBaseUrl: string;
  thumbnailBaseUrl: string;
}

export function ReviewClientPage({
  token,
  previewBaseUrl,
  submissionBaseUrl,
  thumbnailBaseUrl,
}: ReviewClientPageProps) {
  const { domain } = useDomain();
  const trpc = useTRPC();
  // const { viewedRefs, addViewedRefs } = useJuryViewedParticipantsStore()
  const [selectedParticipantId, setSelectedParticipantId] = useQueryState(
    "selected-participant-id",
    parseAsInteger,
  );
  const [currentParticipantIndex, setCurrentParticipantIndex] = useQueryState(
    "current-participant-index",
    parseAsInteger.withDefault(0),
  );
  const [selectedRatings, setSelectedRatings] = useQueryState(
    "rating-filter",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );

  // useEffect(() => {
  //   const stored = localStorage.getItem(`jury-selected-participant-${token}`)
  //   if (stored) {
  //     setSelectedParticipantId(parseInt(stored, 10))
  //   }
  // }, [token, setSelectedParticipantId])

  // useEffect(() => {
  //   if (selectedParticipantId !== null) {
  //     localStorage.setItem(
  //       `jury-selected-participant-${token}`,
  //       selectedParticipantId.toString()
  //     )
  //   }
  // }, [selectedParticipantId, token])

  const { data: ratingsData, isLoading: isRatingsLoading } = useQuery(
    trpc.jury.getJuryRatingsByInvitation.queryOptions({ token }),
  );

  const { data: invitationData } = useQuery(
    trpc.jury.verifyTokenAndGetInitialData.queryOptions({ token }),
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isLoading: isParticipantsLoading,
  } = useInfiniteQuery(
    trpc.jury.getJurySubmissionsFromToken.infiniteQueryOptions(
      {
        token,
        ratingFilter: selectedRatings.length > 0 ? selectedRatings : undefined,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      },
    ),
  );

  const { data: totalParticipants } = useQuery(
    trpc.jury.getJuryParticipantCount.queryOptions({
      token,
      ratingFilter: selectedRatings.length > 0 ? selectedRatings : undefined,
    }),
  );

  const handleParticipantSelect = (
    participantId: number,
    reference: string,
  ) => {
    // addViewedRefs([reference], domain, token)
    setSelectedParticipantId(participantId);
  };

  const handleBackToList = () => {
    setCurrentParticipantIndex(0);
    setSelectedParticipantId(null);
  };

  const toggleRatingFilter = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  // const viewedParticipants = viewedRefs.filter(
  //   (ref) => ref.startsWith(domain) && ref.endsWith(token)
  // )
  // const viewedCount = viewedParticipants.length

  const isLoading = isRatingsLoading || isParticipantsLoading;

  return (
    <main className="min-h-screen bg-neutral-950">
      <Suspense fallback={<JuryHeaderSkeleton />}>
        <JuryHeader
          viewedCount={ratingsData?.ratings.length || 0}
          token={token}
        />
      </Suspense>

      {/* If a participant is selected, show the ParticipantSubmissions component */}
      {selectedParticipantId ? (
        <SubmissionViewer
          domain={domain}
          token={token}
          initialParticipantId={selectedParticipantId}
          onBack={handleBackToList}
          previewBaseUrl={previewBaseUrl}
          submissionBaseUrl={submissionBaseUrl}
          ratingsData={
            ratingsData?.ratings.map((r) => ({
              ...r,
              notes: r.notes || undefined,
            })) || []
          }
          invitationData={invitationData}
          allParticipantsCount={totalParticipants?.value || 0}
        />
      ) : isLoading ? (
        <ParticipantListLoading />
      ) : (
        <ParticipantList
          data={data}
          ratings={ratingsData?.ratings || []}
          selectedRatings={selectedRatings}
          toggleRatingFilter={toggleRatingFilter}
          onParticipantSelect={handleParticipantSelect}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          error={error as Error | null}
          totalParticipants={totalParticipants}
          domain={domain}
          token={token}
          thumbnailsUrl={thumbnailBaseUrl}
        />
      )}
    </main>
  );
}
