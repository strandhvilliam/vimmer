import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StaffClientPage } from "./client-page";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { Suspense } from "react";
import { Resource } from "sst";

export default async function StaffPage() {
  const session = await getSession();
  const domain = await getDomain();

  if (!session) {
    redirect("/auth/login/staff");
  }

  batchPrefetch([
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions({
      staffId: session.user.id,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <StaffClientPage
          baseSubmissionUrl={Resource.SubmissionsRouter.url}
          baseThumbnailUrl={Resource.ThumbnailsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
