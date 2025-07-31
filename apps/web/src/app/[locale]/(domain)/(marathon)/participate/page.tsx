import { LoadingLogo } from "@/components/loading-logo";
import { ParticipateClientPage } from "./client-page";
import { getDomain } from "@/lib/get-domain";
import {
  HydrateClient,
  batchPrefetch,
  getQueryClient,
  trpc,
} from "@/trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Resource } from "sst";

export default async function ParticipatePage() {
  const queryClient = getQueryClient();
  const domain = await getDomain();

  try {
    await queryClient.fetchQuery(
      trpc.marathons.getByDomain.queryOptions({
        domain,
      }),
    );
  } catch (error: any) {
    console.error(error);
    notFound();
  }

  batchPrefetch([
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
    trpc.terms.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLogo />}>
        <ParticipateClientPage
          marathonSettingsRouterUrl={Resource.MarathonSettingsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
