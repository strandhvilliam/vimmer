"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ImageOff,
  GitGraph,
  UserIcon,
  ArrowLeft,
  Star,
  StickyNote,
} from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Label } from "@vimmer/ui/components/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@vimmer/ui/components/carousel";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompleteReviewButton } from "@/components/jury/complete-review-button";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  Submission,
  Topic,
} from "@vimmer/api/db/types";

type ViewerSubmission = Submission & {
  topic: Topic;
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
};

interface ParticipantSubmissionsProps {
  token: string;
  participantId: number;
  onBack: () => void;
  baseUrl: string;
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
      <span className="text-xs text-neutral-500">
        Viewing participant submissions
      </span>
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

function transformSubmissionForViewer(
  submission: ViewerSubmission,
  baseUrl: string,
) {
  return {
    id: submission.id.toString(),
    title: submission.topic?.name || `Photo ${submission.id}`,
    artist:
      `${submission.participant?.firstname || ""} ${submission.participant?.lastname || ""}`.trim() ||
      "Anonymous",
    imageUrl: submission.previewKey
      ? `${baseUrl}/${submission.previewKey}`
      : null,
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

export function ParticipantSubmissions({
  token,
  participantId,
  onBack,
  baseUrl,
}: ParticipantSubmissionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading: queryLoading } = useQuery(
    trpc.jury.getParticipantSubmissions.queryOptions({
      token,
      participantId,
    }),
  );

  // Get existing rating for this participant
  const { data: existingRating } = useQuery(
    trpc.jury.getRating.queryOptions({
      token,
      participantId,
    }),
  );

  // Mutations for saving ratings
  const createRatingMutation = useMutation(
    trpc.jury.createRating.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.pathKey(),
        });
      },
    }),
  );

  const updateRatingMutation = useMutation(
    trpc.jury.updateRating.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.pathKey(),
        });
      },
    }),
  );

  const { submissions: rawSubmissions, invitation } = data || {
    submissions: [],
    invitation: null,
  };

  const submissions = useMemo(() => {
    return rawSubmissions.map((rawSubmissions) =>
      transformSubmissionForViewer(rawSubmissions, baseUrl),
    );
  }, [rawSubmissions, baseUrl]);

  const currentSubmission = submissions[currentIndex];
  const participant = rawSubmissions[0]?.participant;
  const participantName = participant
    ? `${participant.firstname || ""} ${participant.lastname || ""}`.trim() ||
      "Anonymous"
    : "Anonymous";

  // Load existing rating when component mounts or participant changes
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating || 0);
      setNotes(existingRating.notes || "");
    } else {
      setRating(0);
      setNotes("");
    }
  }, [existingRating, participantId]);

  // Save rating function
  const saveRating = async (newRating: number, newNotes: string) => {
    if (newRating === 0) return; // Don't save empty ratings

    setIsSaving(true);
    try {
      const data = { token, participantId, rating: newRating, notes: newNotes };

      if (existingRating) {
        await updateRatingMutation.mutateAsync(data);
      } else {
        await createRatingMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Failed to save rating:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (rating > 0 || notes.trim()) {
        saveRating(rating, notes);
      }
    }, 500); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [rating, notes]);

  const handleImageError = (submissionId: string) => {
    setImageErrors((prev) => new Set(prev).add(submissionId));
  };

  const handleRatingClick = (star: number) => {
    setRating(star);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const newIndex = api.selectedScrollSnap();
      setCurrentIndex(newIndex);
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
      } else if (e.key === "Escape") {
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [api, onBack]);

  if (queryLoading) {
    return (
      <main className="min-h-screen bg-neutral-950">
        <div className="flex w-full border-b items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse" />
            <div className="w-6 h-6 bg-neutral-800 rounded animate-pulse" />
            <div className="flex flex-col">
              <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
          <div className="text-center max-w-md">
            <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse mb-4 mx-auto" />
            <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (submissions.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-950">
        <div className="flex w-full border-b items-center h-16 px-4 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-neutral-400 hover:text-neutral-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Participants
            </Button>
            <GitGraph className="w-6 h-6 text-neutral-50" />
            <div className="flex flex-col">
              <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
                {participantName}'s Submissions
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
                  0 submissions to review
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
              No Submissions Found
            </h1>
            <p className="text-neutral-400">
              This participant has no submissions matching the specified
              criteria.
            </p>
            <Button
              variant="outline"
              onClick={onBack}
              className="mt-4 border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Participants
            </Button>
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
            size="sm"
            onClick={onBack}
            className="text-neutral-400 hover:text-neutral-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Participants
          </Button>
          <GitGraph className="w-6 h-6 text-neutral-50" />
          <div className="flex flex-col">
            <h1 className="text-xl text-neutral-50 font-semibold font-rocgrotesk">
              {participantName}'s Submissions
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
                {submissions.length} submission
                {submissions.length !== 1 ? "s" : ""} to review
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

      <div className="flex h-[calc(100vh-4rem)] bg-neutral-950">
        {/* Carousel Section - Left Side */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
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
                        className="object-contain transition-opacity duration-300 max-h-full max-w-full"
                        onError={() => handleImageError(submission.id)}
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
            {currentIndex + 1} / {submissions.length}
          </div>
        </div>

        {/* Control Panel - Right Side */}
        <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
          {currentSubmission && (
            <>
              {/* Submission Info */}
              <Card className="m-4 bg-neutral-800 border-neutral-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-neutral-50">
                    {currentSubmission.title}
                  </CardTitle>
                  <p className="text-sm text-neutral-400">
                    By {currentSubmission.artist}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {currentSubmission.categories.map(
                      (category: any, index: any) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-neutral-700 text-neutral-200"
                        >
                          {category}
                        </Badge>
                      ),
                    )}
                  </div>

                  <p className="text-sm text-neutral-300">
                    {currentSubmission.description}
                  </p>

                  <div className="text-xs text-neutral-500">
                    <p>Submitted: {currentSubmission.submissionDate}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Star Rating */}
              <Card className="mx-4 mb-4 bg-neutral-800 border-neutral-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-neutral-50 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                    {isSaving && (
                      <span className="text-xs text-neutral-400 ml-auto">
                        Saving...
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8 hover:bg-neutral-700"
                        onClick={() => handleRatingClick(star)}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-neutral-500"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-xs text-neutral-400 mt-2">
                      Rated {rating} out of 5 stars
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="mx-4 mb-4 bg-neutral-800 border-neutral-700 flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-neutral-50 flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <Label
                    htmlFor="notes"
                    className="text-sm text-neutral-300 mb-2"
                  >
                    Add your review notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter your notes about this submission..."
                    value={notes}
                    onChange={handleNotesChange}
                    className="flex-1 min-h-32 bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 resize-none"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
