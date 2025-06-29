import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StaffInterface } from "./_components/staff-interface";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { Suspense } from "react";

export default async function StaffPage() {
  const session = await getSession();
  const domain = await getDomain();

  if (!session) {
    redirect("/staff/login");
  }

  const { user } = session;

  batchPrefetch([
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions({
      staffId: user.id,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <StaffInterface />
      </Suspense>
    </HydrateClient>
  );
}
