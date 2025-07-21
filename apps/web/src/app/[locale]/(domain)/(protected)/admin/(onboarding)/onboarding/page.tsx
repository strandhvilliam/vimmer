import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./_components/onboarding-flow";
import { OnboardingLoading } from "./_components/onboarding-loading";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/trpc/server";
import { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { Resource } from "sst";
import { notFound } from "next/navigation";

export default async function OnboardingPage() {
  const queryClient = getQueryClient();
  const session = await getSession();

  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
    trpc.rules.getByDomain.queryOptions({
      domain,
    }),
  ]);

  const marathon = await queryClient.fetchQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  if (!session) {
    return redirect("/auth/admin/login");
  }

  if (!marathon) {
    notFound();
  }

  if (marathon.setupCompleted) {
    redirect(`/admin/dashboard`);
  }

  return (
    <HydrateClient>
      <Suspense fallback={<OnboardingLoading />}>
        <OnboardingFlow
          marathonSettingsRouterUrl={Resource.MarathonSettingsRouter.url}
        />
      </Suspense>
    </HydrateClient>
  );
}
