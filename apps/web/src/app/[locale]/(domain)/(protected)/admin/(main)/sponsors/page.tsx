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
      <div className="container max-w-[1400px] mx-auto py-8">
        <div className="flex flex-col mb-8 gap-1">
          <h1 className="text-2xl font-semibold font-rocgrotesk">Sponsors</h1>
          <p className="text-muted-foreground text-sm">
            Upload and manage sponsor images for different scenarios.
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <SponsorsClientPage
            domain={domain}
            baseUrl={Resource.MarathonSettingsRouter.url}
          />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
