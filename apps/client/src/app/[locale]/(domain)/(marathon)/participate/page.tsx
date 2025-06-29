import { ParticipateClientPage } from "./client-page";
import { getDomain } from "@/lib/get-domain";
import { HydrateClient, batchPrefetch, trpc } from "@/trpc/server";

export default async function ParticipatePage() {
  const domain = await getDomain();

  void batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <ParticipateClientPage />
    </HydrateClient>
  );
}
