"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { Mail, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JuryInvitation } from "@vimmer/api/db/types";

export default function InitialView({
  invitation,
  children,
}: {
  invitation: JuryInvitation;
  children: React.ReactNode;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending: isUpdating } = useMutation(
    trpc.jury.updateJuryInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Welcome! You can now start reviewing submissions.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.pathKey(),
        });
      },
    })
  );

  const handleGetStarted = () => {
    updateStatus({
      id: invitation.id,
      data: {
        status: "in_progress",
      },
    });
  };

  if (invitation.status === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Review Completed</CardTitle>
              <CardDescription>
                Thank you for completing your review
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Status</p>
                    <p className="text-sm text-muted-foreground">
                      Review completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Jury Member</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {invitation.displayName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <p className="font-medium text-green-900">
                  Your review has been completed!
                </p>
                <p className="text-sm text-green-700">
                  Thank you for your participation in the jury process. Your
                  review has been successfully submitted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (
    invitation.status === "in_progress" ||
    invitation.status === "completed"
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Jury Invitation</CardTitle>
            <CardDescription>
              You've been invited to review submissions as a jury member
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Jury Member</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {invitation.displayName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Review Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invitation.expiresAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {invitation.notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-sm text-blue-900 mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-blue-700">{invitation.notes}</p>
                </div>
              )}
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Ready to start reviewing submissions?
              </p>
              <Button
                onClick={handleGetStarted}
                disabled={isUpdating}
                className="w-full"
                size="lg"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Getting Started...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
