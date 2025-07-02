import { Separator } from "@vimmer/ui/components/separator";
import { Suspense } from "react";
import { ClassesLoadingSkeleton } from "./_components/class-loading-skeleton";
import { DeviceGroupsSection } from "./_components/device-groups-section";
import { CompetitionClassSection } from "./_components/competition-class-section";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, trpc } from "@/trpc/server";

export default async function ClassesPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({ domain }),
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-10 max-w-[1300px]">
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <CompetitionClassSection />
      </Suspense>
      <Separator className="my-8" />
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <DeviceGroupsSection />
      </Suspense>
    </div>
  );
}
