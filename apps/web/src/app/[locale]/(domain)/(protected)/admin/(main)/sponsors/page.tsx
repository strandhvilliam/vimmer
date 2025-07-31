import { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { SponsorsClientPage } from "./client-page";
import { HydrateClient, batchPrefetch, trpc } from "@/trpc/server";
import { Resource } from "sst";

export default async function SponsorsPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <SponsorsClientPage
          domain={domain}
          baseUrl={Resource.MarathonSettingsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
