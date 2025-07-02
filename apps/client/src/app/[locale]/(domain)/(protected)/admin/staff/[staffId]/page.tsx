import { Suspense } from "react";
import { StaffDetailsClient } from "./staff-details-client";
import { getDomain } from "@/lib/get-domain";
import { HydrateClient, batchPrefetch, trpc } from "@/trpc/server";
import { StaffDetailsSkeleton } from "../_components/staff-details-skeleton";

interface PageProps {
  params: Promise<{
    staffId: string;
  }>;
}

export default async function StaffDetailsPage({ params }: PageProps) {
  const domain = await getDomain();
  const { staffId } = await params;

  batchPrefetch([
    trpc.users.getStaffMemberById.queryOptions({
      staffId,
      domain,
    }),
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions({
      staffId,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<StaffDetailsSkeleton />}>
        <StaffDetailsClient staffId={staffId} />
      </Suspense>
    </HydrateClient>
  );
}
