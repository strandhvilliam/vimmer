"use client"

import { Star, StickyNote, Keyboard } from "lucide-react"
import { Button } from "@vimmer/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card"
import { Badge } from "@vimmer/ui/components/badge"
import { Textarea } from "@vimmer/ui/components/textarea"
import { Label } from "@vimmer/ui/components/label"
import { useMutationState } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export interface JuryParticipant {
  id: number
  reference: string
  createdAt: string
  status?: string | null
  contactSheetKey?: string | null
  competitionClass?: {
    id: number
    name: string
  } | null
  deviceGroup?: {
    id: number
    name: string
  } | null
  submission?: {
    id: number
    createdAt: string
    previewKey?: string | null
    topic?: {
      id: number
      name: string
    } | null
  } | null
}

interface JurySidebarProps {
  currentParticipant: JuryParticipant | null | undefined
  rating: number
  notes: string
  isSaving: boolean
  onRatingClick: (star: number) => void
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  isClassInvitation: boolean
  participantName: string
}

export function JurySidebar({
  currentParticipant,
  rating,
  notes,
  isSaving,
  onRatingClick,
  onNotesChange,
  isClassInvitation,
  participantName,
}: JurySidebarProps) {
  if (!currentParticipant) return null

  return (
    <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
      <Card className="m-4 bg-neutral-800 border-neutral-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-neutral-50">
            #{participantName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {currentParticipant.submission?.topic?.name && (
              <Badge
                variant="secondary"
                className="bg-vimmer-primary/20 text-white border border-vimmer-primary/50"
              >
                {currentParticipant.submission.topic.name}
              </Badge>
            )}
            {currentParticipant.competitionClass?.name && (
              <Badge
                variant="secondary"
                className="bg-neutral-700 text-neutral-200"
              >
                {currentParticipant.competitionClass.name}
              </Badge>
            )}
            {currentParticipant.deviceGroup?.name && (
              <Badge
                variant="secondary"
                className="bg-neutral-700 text-neutral-200"
              >
                {currentParticipant.deviceGroup.name}
              </Badge>
            )}
          </div>

          <p className="text-sm text-neutral-300">
            {isClassInvitation
              ? `Contact sheet for ${participantName}`
              : `Submission for topic "${currentParticipant.submission?.topic?.name || "Unknown"}"`}
          </p>

          <div className="text-xs text-neutral-500">
            <p>
              Submitted:{" "}
              {new Date(
                currentParticipant.submission?.createdAt ||
                  currentParticipant.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-4 mb-4 bg-neutral-800 border-neutral-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-neutral-50 flex items-center gap-2">
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
                className="relative p-1 h-8 w-8 hover:bg-neutral-700 group"
                onClick={() => onRatingClick(star)}
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-500"
                  }`}
                />
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ⌘{star}
                </span>
              </Button>
            ))}
          </div>
          {rating === 0 ? (
            <p className="text-xs text-neutral-400 mt-2">No rating yet</p>
          ) : (
            <p className="text-xs text-neutral-400 mt-2">
              Rated {rating} out of 5 stars
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mx-4 mb-4 bg-neutral-800 border-neutral-700 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-neutral-50 flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Label htmlFor="notes" className="text-sm text-neutral-300 mb-2">
            Add your review notes
          </Label>
          <Textarea
            id="notes"
            placeholder={`Enter your notes about ${participantName}'s ${isClassInvitation ? "contact sheet" : "submission"}...`}
            value={notes}
            onChange={onNotesChange}
            className="flex-1 min-h-32 bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 resize-none"
          />
        </CardContent>
      </Card>

      <Card className="mx-4 mb-4 bg-neutral-800 border-neutral-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-50 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>⌘/Ctrl + 1-5</span>
            <span>Star rating</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>⌘/Ctrl + 0</span>
            <span>Clear rating</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>← →</span>
            <span>Navigate</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Esc</span>
            <span>Back to list</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
