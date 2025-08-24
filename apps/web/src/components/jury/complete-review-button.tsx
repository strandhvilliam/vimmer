"use client"

import { Button } from "@vimmer/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@vimmer/ui/components/alert-dialog"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { useRouter } from "next/navigation"

interface CompleteReviewButtonProps {
  token: string
  invitationId: number
}

export function CompleteReviewButton({
  token,
  invitationId,
}: CompleteReviewButtonProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: completeReview, isPending: isCompleting } = useMutation(
    trpc.jury.updateJuryInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Review completed successfully!")
        router.push(`/jury?token=${token}`)
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to complete review. Please try again."
        )
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.pathKey(),
        })
      },
    })
  )

  const handleCompleteReview = () => {
    completeReview({
      id: invitationId,
      data: { status: "completed" },
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <PrimaryButton disabled={isCompleting}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Review
        </PrimaryButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark this review as completed? This action
            cannot be undone and you will no longer be able to make changes to
            your submissions review.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCompleteReview}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Review
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
