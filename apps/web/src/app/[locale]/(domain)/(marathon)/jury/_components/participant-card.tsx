"use client"

import { Star, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@vimmer/ui/components/card"
import { Badge } from "@vimmer/ui/components/badge"

interface Participant {
  id: number
  reference: string
  competitionClass?: { name: string; numberOfPhotos: number } | null
  deviceGroup?: { name: string } | null
}

interface ParticipantCardProps {
  participant: Participant
  rating: number
  onClick: () => void
  thumbnailUrl: string
}

export function ParticipantCard({
  participant,
  rating,
  onClick,
  thumbnailUrl,
}: ParticipantCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${"bg-neutral-900 border-neutral-700 hover:border-neutral-500"}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-start justify-between mb-1">
            <div className="flex flex-col">
              <h3 className="font-semibold text-neutral-50 text-2xl font-rocgrotesk">
                {participant.reference}
              </h3>
            </div>
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
          <div className="flex w-fit gap-1 items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-neutral-500"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 border border-neutral-600">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for ${participant.reference}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to ImageIcon if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const fallback =
                    target.parentElement?.querySelector(".image-fallback")
                  if (fallback) {
                    ;(fallback as HTMLElement).style.display = "flex"
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-neutral-400" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
