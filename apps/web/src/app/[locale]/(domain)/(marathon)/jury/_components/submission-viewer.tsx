"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  ImageOff,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import { Button } from "@vimmer/ui/components/button"
import { useTRPC } from "@/trpc/client"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { JurySidebar } from "./jury-sidebar"
import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs"
import { toast } from "sonner"

interface ParticipantSubmissionsProps {
  token: string
  initialParticipantId?: number
  onBack: () => void
  previewBaseUrl: string
  domain: string
  submissionBaseUrl: string
  ratingsData: { participantId: number; rating: number; notes?: string }[]
  invitationData: { inviteType: string } | undefined
  allParticipantsCount: number
}

export function SubmissionViewer({
  token,
  initialParticipantId,
  onBack,
  // previewBaseUrl,
  domain,
  submissionBaseUrl,
  ratingsData,
  invitationData,
  allParticipantsCount,
}: ParticipantSubmissionsProps) {
  const [currentParticipantIndex, setCurrentParticipantIndex] = useQueryState(
    "current-participant-index",
    parseAsInteger.withDefault(0)
  )
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [hasSetInitialIndex, setHasSetInitialIndex] = useState(false)
  const [keyboardNavigationFeedback, setKeyboardNavigationFeedback] = useState<
    "prev" | "next" | "rating" | null
  >(null)

  // Rate limiting for navigation to prevent spam clicking
  const lastNavigationTimeRef = useRef<number>(0)
  const NAVIGATION_THROTTLE_MS = 200 // 0.2 second throttle

  // Rating filter state (same as parent component)
  const [selectedRatings, setSelectedRatings] = useQueryState(
    "rating-filter",
    parseAsArrayOf(parseAsInteger).withDefault([])
  )

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const {
    data: participantsData,
    isLoading: participantsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.jury.getJurySubmissionsFromToken.infiniteQueryOptions(
      {
        token,
        ratingFilter: selectedRatings.length > 0 ? selectedRatings : undefined,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    )
  )

  // Flatten participants from all pages
  const participants = useMemo(
    () =>
      participantsData?.pages?.flatMap((page) => page.participants || []) || [],
    [participantsData]
  )
  const invitation = invitationData

  // Find the initial participant index if provided (only once)
  const handleSetInitialIndex = useCallback(() => {
    if (
      initialParticipantId &&
      participants.length > 0 &&
      !hasSetInitialIndex
    ) {
      const index = participants.findIndex((p) => p.id === initialParticipantId)
      if (index !== -1) {
        setCurrentParticipantIndex(index)
        setHasSetInitialIndex(true)
      }
    }
  }, [
    initialParticipantId,
    participants,
    hasSetInitialIndex,
    setCurrentParticipantIndex,
  ])

  // Set initial index when participants load
  useEffect(() => {
    if (
      initialParticipantId &&
      participants.length > 0 &&
      !hasSetInitialIndex
    ) {
      handleSetInitialIndex()
    }
  }, [
    initialParticipantId,
    participants,
    hasSetInitialIndex,
    handleSetInitialIndex,
  ])

  const currentParticipant = useMemo(
    () => participants[currentParticipantIndex],
    [participants, currentParticipantIndex]
  )
  const currentParticipantId = currentParticipant?.id

  // Mark participant as viewed when switching (now handled in useEffect)

  // Get existing rating for current participant
  const existingRating = useMemo(() => {
    return ratingsData.find((r) => r.participantId === currentParticipantId)
  }, [ratingsData, currentParticipantId])

  // Local state for rating and notes (no debounce, direct updates)
  const [localRating, setLocalRating] = useState(0)
  const [localNotes, setLocalNotes] = useState("")
  const notesTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Update local state when participant changes (using useEffect to avoid infinite renders)
  useEffect(() => {
    if (existingRating) {
      setLocalRating(existingRating.rating || 0)
      setLocalNotes(existingRating.notes || "")
    } else {
      setLocalRating(0)
      setLocalNotes("")
    }
  }, [existingRating, currentParticipantId])

  // Mark participant as viewed when switching (using useEffect to avoid side effects in render)
  // useEffect(() => {
  //   if (currentParticipant?.reference) {
  //     if (!viewedRefs.includes(currentParticipant?.reference)) {
  //       addViewedRefs([currentParticipant?.reference], domain, token)
  //     }
  //   }
  // }, [currentParticipant?.reference, viewedRefs, addViewedRefs, domain, token])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current)
      }
    }
  }, [])

  // Clear keyboard feedback after a short delay
  useEffect(() => {
    if (keyboardNavigationFeedback) {
      const timeout = setTimeout(() => {
        setKeyboardNavigationFeedback(null)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [keyboardNavigationFeedback])

  const createRatingMutation = useMutation(
    trpc.jury.createRating.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getRating.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJuryRatingsByInvitation.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJurySubmissionsFromToken.infiniteQueryKey(),
        })
      },
    })
  )

  const updateRatingMutation = useMutation(
    trpc.jury.updateRating.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getRating.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJuryRatingsByInvitation.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJurySubmissionsFromToken.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJurySubmissionsFromToken.infiniteQueryKey(),
        })
      },
    })
  )

  const deleteRatingMutation = useMutation(
    trpc.jury.deleteRating.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getRating.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.jury.getJuryRatingsByInvitation.queryKey(),
        })
      },
    })
  )

  const participantName = currentParticipant?.reference || "Unknown"

  // Direct save function without debouncing
  const saveRating = useCallback(
    async (newRating: number, newNotes: string) => {
      if (!currentParticipantId) return

      setIsSaving(true)
      try {
        const data = {
          token,
          participantId: currentParticipantId,
          rating: newRating,
          notes: newNotes,
        }

        if (existingRating) {
          if (newRating === 0 && !newNotes.trim()) {
            // Delete the rating if clearing both rating and notes
            await deleteRatingMutation.mutateAsync({
              token,
              participantId: currentParticipantId,
            })
          } else {
            await updateRatingMutation.mutateAsync(data)
            if (!selectedRatings.includes(newRating)) {
              toast.info(
                "New rating not included in filtering. Going to previous participant"
              )
            }
          }
        } else if (newRating > 0 || newNotes.trim()) {
          // Create new rating if rating > 0 or has notes
          await createRatingMutation.mutateAsync(data)
        }
      } catch (error) {
        console.error("Failed to save rating:", error)
      } finally {
        setIsSaving(false)
      }
    },
    [
      currentParticipantId,
      token,
      existingRating,
      deleteRatingMutation,
      updateRatingMutation,
      selectedRatings,
      createRatingMutation,
    ]
  )

  const handleImageError = (submissionId: string) => {
    setImageErrors((prev) => new Set(prev).add(submissionId))
  }

  const handleRatingClickWithFeedback = useCallback(
    (star: number, fromKeyboard = false) => {
      const newRating = star === localRating ? 0 : star
      setLocalRating(newRating)
      saveRating(newRating, localNotes)
      if (fromKeyboard) {
        setKeyboardNavigationFeedback("rating")
      }
    },
    [localRating, localNotes, saveRating]
  )

  const handleRatingClick = useCallback(
    (star: number) => {
      handleRatingClickWithFeedback(star, false)
    },
    [handleRatingClickWithFeedback]
  )

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value
      setLocalNotes(newNotes)

      // Clear existing timeout
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current)
      }

      // Save notes after a short delay to avoid excessive API calls
      notesTimeoutRef.current = setTimeout(() => {
        saveRating(localRating, newNotes)
      }, 1000)
    },
    [localRating, saveRating]
  )

  const toggleRatingFilter = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    )
  }

  const handlePreviousParticipant = useCallback(
    (fromKeyboard = false) => {
      if (currentParticipantIndex <= 0) {
        return
      }

      const now = Date.now()
      const timeSinceLastNavigation = now - lastNavigationTimeRef.current

      // Apply rate limiting only for non-keyboard interactions (button clicks/holds)
      if (timeSinceLastNavigation < NAVIGATION_THROTTLE_MS) {
        return
      }

      lastNavigationTimeRef.current = now
      setCurrentParticipantIndex(currentParticipantIndex - 1)
      if (fromKeyboard) {
        setKeyboardNavigationFeedback("prev")
      }
    },
    [currentParticipantIndex, setCurrentParticipantIndex]
  )

  const handleNextParticipant = useCallback(
    (fromKeyboard = false) => {
      if (currentParticipantIndex >= participants.length - 1) {
        return
      }

      const now = Date.now()
      const timeSinceLastNavigation = now - lastNavigationTimeRef.current

      // Apply rate limiting only for non-keyboard interactions (button clicks/holds)
      if (timeSinceLastNavigation < NAVIGATION_THROTTLE_MS) {
        return
      }
      lastNavigationTimeRef.current = now
      setCurrentParticipantIndex(currentParticipantIndex + 1)

      // Prefetch more data when approaching the end
      const remainingItems = participants.length - currentParticipantIndex - 1
      if (remainingItems <= 5 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }

      if (fromKeyboard) {
        setKeyboardNavigationFeedback("next")
      }
    },
    [
      currentParticipantIndex,
      participants.length,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      setCurrentParticipantIndex,
    ]
  )

  // Auto-prefetch when approaching end of list (using useEffect to avoid calling during render)
  useEffect(() => {
    const remainingItems = participants.length - currentParticipantIndex - 1
    if (remainingItems <= 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [
    currentParticipantIndex,
    participants.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  // Keyboard navigation with proper event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields or textareas
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          handlePreviousParticipant(true)
          break
        case "ArrowRight":
          e.preventDefault()
          handleNextParticipant(true)
          break
        case "Escape":
          e.preventDefault()
          onBack()
          break
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          if (e.metaKey || e.ctrlKey) {
            // Lightroom-style star ratings with Cmd/Ctrl + number keys
            e.preventDefault()
            const ratingValue = parseInt(e.key, 10)
            handleRatingClickWithFeedback(ratingValue, true)
          }
          break
        case "0":
          if (e.metaKey || e.ctrlKey) {
            // Clear rating with Cmd/Ctrl + 0 key (like Lightroom)
            e.preventDefault()
            handleRatingClickWithFeedback(0, true)
          }
          break
        case " ": {
          // Spacebar for quick rating toggle (1 star if unrated, 0 if rated)
          e.preventDefault()
          const newRating = localRating === 0 ? 1 : 0
          handleRatingClickWithFeedback(newRating, true)
          break
        }
        default:
          break
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeyDown)

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    handlePreviousParticipant,
    handleNextParticipant,
    onBack,
    handleRatingClickWithFeedback,
    localRating,
  ])

  // Determine what to display based on invitation type
  const isTopicInvitation = invitation?.inviteType === "topic"
  const isClassInvitation = invitation?.inviteType === "class"

  // Get image URL based on invitation type
  const getImageUrl = () => {
    const bucketurl =
      "https://vimmer-production-contactsheetsbucketbucket-sswnzfxo.s3.eu-north-1.amazonaws.com/"

    if (isClassInvitation && currentParticipant?.contactSheetKey) {
      return `${bucketurl}/${currentParticipant.contactSheetKey}`
    } else if (isTopicInvitation && currentParticipant?.submission?.key) {
      return `${submissionBaseUrl}/${currentParticipant.submission.key}`
    }
    return null
  }

  const imageUrl = getImageUrl()
  const imageId =
    currentParticipant?.submission?.id?.toString() ||
    currentParticipant?.id?.toString() ||
    ""

  // Get total participant count
  const totalParticipantCount = useMemo(() => {
    if (selectedRatings.length > 0) {
      return participants.length
    }
    return allParticipantsCount
  }, [participants.length, allParticipantsCount, selectedRatings])

  if (participantsLoading) {
    return (
      <div className="flex h-screen bg-neutral-950">
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
          <div className="text-center max-w-md">
            <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse mb-4 mx-auto" />
            <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (participants.length === 0) {
    return (
      <div className="flex h-screen bg-neutral-950">
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl text-neutral-50 font-semibold mb-4">
              No Participants Found
            </h1>
            <p className="text-neutral-400">
              There are no participants with submissions matching the specified
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-950 relative">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-9 px-3 bg-black/50 hover:bg-black/70 text-white border-neutral-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            {currentParticipantIndex + 1} of {totalParticipantCount}
          </span>

          <div className="flex items-center gap-2">
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
      </div>

      <div className="flex flex-1 relative h-[calc(100vh-8rem)]">
        <div className="flex-1 relative flex items-start justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-start justify-center">
            {imageUrl && !imageErrors.has(imageId) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={
                  isClassInvitation
                    ? "Contact Sheet"
                    : currentParticipant?.submission?.topic?.name ||
                      "Submission"
                }
                className="object-contain transition-opacity duration-300 max-w-full max-h-full"
                onError={() => handleImageError(imageId)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 rounded-lg p-8 max-w-md">
                <ImageOff className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isClassInvitation
                    ? "Contact Sheet Not Available"
                    : "Image Not Available"}
                </h3>
                <p className="text-sm text-center text-neutral-500">
                  {!imageUrl
                    ? `The ${isClassInvitation ? "contact sheet" : "image"} for "${participantName}" is not available.`
                    : `Failed to load ${isClassInvitation ? "contact sheet" : "image"} for "${participantName}". Please try refreshing the page.`}
                </p>
              </div>
            )}
          </div>

          {isFetchingNextPage && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePreviousParticipant(false)}
            disabled={currentParticipantIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 ${
              keyboardNavigationFeedback === "prev"
                ? "bg-blue-500/80 hover:bg-blue-600/80 scale-125"
                : "bg-black/30 hover:bg-black/50"
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleNextParticipant(false)}
            disabled={currentParticipantIndex === participants.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 ${
              keyboardNavigationFeedback === "next"
                ? "bg-blue-500/80 hover:bg-blue-600/80 scale-125"
                : "bg-black/30 hover:bg-black/50"
            }`}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </div>

        <JurySidebar
          currentParticipant={currentParticipant}
          rating={localRating}
          notes={localNotes}
          isSaving={isSaving}
          onRatingClick={handleRatingClick}
          onNotesChange={handleNotesChange}
          isClassInvitation={isClassInvitation}
          participantName={participantName}
        />
      </div>
    </div>
  )
}
