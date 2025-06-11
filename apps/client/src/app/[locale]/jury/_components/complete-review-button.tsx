"use client";

import { Button } from "@vimmer/ui/components/button";
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
} from "@vimmer/ui/components/alert-dialog";
import { CheckCircle } from "lucide-react";
import { updateInvitationStatusAction } from "../_actions/jury-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface CompleteReviewButtonProps {
  invitationId: number;
}

export default function CompleteReviewButton({
  invitationId,
}: CompleteReviewButtonProps) {
  const { execute: completeReview, isExecuting } = useAction(
    updateInvitationStatusAction,
    {
      onSuccess: () => {
        toast.success("Review completed successfully!");
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError || "Failed to complete review. Please try again."
        );
      },
    }
  );

  const handleCompleteReview = () => {
    completeReview({
      invitationId,
      status: "completed",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExecuting}
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Review
        </Button>
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
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExecuting ? (
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
  );
}
