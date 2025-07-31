"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Info, ImageOff, GitGraph, UserIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@vimmer/ui/components/carousel";
import { useTRPC } from "@/trpc/client";
import {
  useInfiniteQuery,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import CompleteReviewButton from "../../../../../../components/jury/complete-review-button";

const PREVIEW_BASE_URL = "https://d2w93ix7jvihnu.cloudfront.net";

interface ImageViewerProps {
  token: string;
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

function getPreviewImageUrl(submission: any) {
  return submission.previewKey
    ? `${PREVIEW_BASE_URL}/${submission.previewKey}`
    : null;
}

function transformSubmissionForViewer(submission: any) {
  return {
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
    submissionDate: new Date(submission.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export default function ImageViewer({ token }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const trpc = useTRPC();

  // Get total count
  const { data: countData } = useSuspenseQuery(
    trpc.jury.getSubmissionsCount.queryOptions({
      token,
    }),
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...trpc.jury.getSubmissionsPaginated.infiniteQueryOptions({
        token,
        limit: 50,
      }),
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    });

  const submissions = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.items.map(transformSubmissionForViewer),
    );
  }, [data]);

  const invitation = data?.pages.at(0)?.invitation;
  const currentSubmission = submissions[currentIndex];
  const totalCount = countData?.count || 0;

  const handleImageError = (submissionId: string) => {
    setImageErrors((prev) => new Set(prev).add(submissionId));
  };

  // Update current index when carousel changes and handle infinite loading
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setIsLoading(true);
      const newIndex = api.selectedScrollSnap();
      setCurrentIndex(newIndex);

      // Fetch next page when approaching the end (within 10 items)
      if (
        hasNextPage &&
        !isFetchingNextPage &&
        newIndex >= submissions.length - 10
      ) {
        fetchNextPage();
      }
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, hasNextPage, isFetchingNextPage, submissions.length, fetchNextPage]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
      } else if (e.key === "i" || e.key === "I") {
        toggleDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [api]);

  if (!currentSubmission) {
    return (
      <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-950">
        <div className="text-center text-neutral-400">
          <p>No submissions available</p>
        </div>
      </div>
    );
  }

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
                  0 of {totalCount} submissions to review
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
                {submissions.length} of {totalCount} submissions loaded
              </span>{" "}
            </div>
            <Avatar className="h-8 w-8 backdrop-blur-md">
              <AvatarFallback>
                <UserIcon className=" h-4 w-4 text-neutral-800" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-950 overflow-hidden">
        {/* Carousel */}
        <Carousel
          className="w-full h-full"
          setApi={setApi}
          opts={{
            align: "center",
          }}
        >
          <CarouselContent className="h-full">
            {submissions.map((submission, index) => (
              <CarouselItem key={submission.id} className="h-full">
                <div className="relative w-full h-full flex items-center justify-center">
                  {submission.imageUrl && !imageErrors.has(submission.id) ? (
                    <img
                      src={submission.imageUrl}
                      alt={submission.title}
                      className="object-contain transition-opacity duration-300"
                      onError={() => handleImageError(submission.id)}
                      onLoad={() => {
                        if (index === currentIndex) setIsLoading(false);
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 rounded-lg p-8 max-w-md">
                      <ImageOff className="w-16 h-16 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Image Not Available
                      </h3>
                      <p className="text-sm text-center text-neutral-500">
                        {!submission.imageUrl
                          ? `The image for "${submission.title}" is not available.`
                          : `Failed to load image for "${submission.title}". Please try refreshing the page.`}
                      </p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 hover:scale-110" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 hover:scale-110" />
        </Carousel>

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {submissions.length} (Total: {totalCount})
        </div>

        {/* Details Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          {showDetails ? (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-bold">
                      {currentSubmission.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By {currentSubmission.artist}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDetails}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>Collapse</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 my-2">
                  {currentSubmission.categories.map(
                    (category: any, index: any) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ),
                  )}
                </div>

                <p className="text-sm mt-2">{currentSubmission.description}</p>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>Submitted: {currentSubmission.submissionDate}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 flex items-center justify-center rounded-full shadow-lg mx-auto bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              onClick={toggleDetails}
            >
              <Info className="h-5 w-5" />
              <span className="sr-only">Show details</span>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
