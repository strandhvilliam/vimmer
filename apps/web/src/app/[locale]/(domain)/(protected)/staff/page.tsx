import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StaffClientPage } from "./client-page"
import { getDomain } from "@/lib/get-domain"
import { batchPrefetch, HydrateClient } from "@/trpc/server"
import { trpc } from "@/trpc/server"
import { Suspense } from "react"
import { Resource } from "sst"
import { StaffLoadingSkeleton } from "@/components/staff/staff-loading-skeleton"

export default async function StaffPage() {
  const session = await getSession()
  const domain = await getDomain()

  if (!session) {
    redirect("/auth/staff/login")
  }

  batchPrefetch([
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions({
      staffId: session.user.id,
      domain,
    }),
    trpc.topics.getPublicByDomain.queryOptions({
      domain,
    }),
  ])

  return (
    <HydrateClient>
      <Suspense fallback={<StaffLoadingSkeleton />}>
        <StaffClientPage
          baseSubmissionUrl={Resource.SubmissionsRouter.url}
          baseThumbnailUrl={Resource.ThumbnailsRouter.url}
          basePreviewUrl={Resource.PreviewsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  )
}
