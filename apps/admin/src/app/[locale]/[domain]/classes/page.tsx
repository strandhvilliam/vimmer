import { Separator } from "@vimmer/ui/components/separator";
import { Suspense } from "react";
import { ClassesLoadingSkeleton } from "./_components/class-loading-skeleton";
import { DeviceGroupsSection } from "./_components/device-groups-section";
import { CompetitionClassSection } from "./_components/competition-class-section";

export default async function ClassesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  return (
    <div className="container mx-auto p-6 space-y-10 max-w-[1300px]">
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <CompetitionClassSection domain={domain} />
      </Suspense>
      <Separator className="my-8" />
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <DeviceGroupsSection domain={domain} />
      </Suspense>
    </div>
  );
}
