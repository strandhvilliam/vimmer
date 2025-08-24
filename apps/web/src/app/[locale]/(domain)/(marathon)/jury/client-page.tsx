"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card"
import {
  Mail,
  Clock,
  CheckCircle,
  PlayCircleIcon,
  UserIcon,
  Tag,
} from "lucide-react"
import { updateInvitationStatusAction } from "./_actions/jury-actions"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { DotPattern } from "@vimmer/ui/components/dot-pattern"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { redirect, useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

export function JuryClientPage({ token }: { token: string }) {
  const trpc = useTRPC()
  const router = useRouter()

  const { data: invitation } = useSuspenseQuery(
    trpc.jury.verifyTokenAndGetInitialData.queryOptions({
      token,
    })
  )

  const { execute: updateStatus, isExecuting } = useAction(
    updateInvitationStatusAction,
    {
      onSuccess: () => {
        toast.success("Welcome! You can now start reviewing submissions.")
        router.push(`/jury/review?token=${invitation.token}`)
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError || "Failed to get started. Please try again."
        )
      },
    }
  )

  const handleGetStarted = () => {
    updateStatus({
      invitationId: invitation.id,
      status: "in_progress",
    })
  }

  if (invitation.status === "in_progress") {
    redirect(`/jury/review?token=${invitation.token}`)
  }

  if (invitation.status === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <DotPattern />
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
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <DotPattern />
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center space-y-0">
            {invitation.marathon?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invitation.marathon.logoUrl}
                alt={invitation.marathon.name}
                className="rounded-full h-16 w-16 mx-auto"
              />
            ) : (
              <div className="mx-auto h-16 w-16 mb-4 p-3 bg-vimmer-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-vimmer-primary" />
              </div>
            )}
            <CardTitle className="text-xl font-rocgrotesk pt-4">
              Jury Invitation
            </CardTitle>
            <CardDescription className="flex flex-col">
              {invitation.marathon.name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
                <div className="p-2 bg-blue-100 rounded-full">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Jury Member</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {invitation.displayName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
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

              {invitation.inviteType === "topic" && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Tag className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Topic</p>
                    <p className="text-sm text-muted-foreground">
                      {invitation.topic?.name}
                    </p>
                  </div>
                </div>
              )}
              {invitation.inviteType === "class" && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Tag className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Class</p>
                    <p className="text-sm text-muted-foreground">
                      {invitation.competitionClass?.name}
                    </p>
                  </div>
                </div>
              )}

              {invitation.notes && (
                <div className="p-3 bg-muted/50 rounded-lg border border-muted">
                  <p className="font-medium text-sm text-foreground mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-foreground">{invitation.notes}</p>
                </div>
              )}
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Ready to start reviewing submissions?
              </p>
              <PrimaryButton
                onClick={handleGetStarted}
                disabled={isExecuting}
                className="w-full py-3 text-base rounded-full"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Getting Started...
                  </>
                ) : (
                  <>
                    <span className="text-lg">Get Started</span>
                    <PlayCircleIcon />
                  </>
                )}
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
