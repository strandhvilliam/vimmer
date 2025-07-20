import { DashboardCards } from "./_components/dashboard-cards";
import { RecentParticipantsTable } from "./_components/recent-participants-table";
import { TimeSeriesChart } from "./_components/time-series-chart";
import { GpsMapChart } from "./_components/gps-map-chart";
import { DeviceGroupChart } from "./_components/device-group-chart";
import { ClassChart } from "./_components/class-chart";
import { Suspense } from "react";
import {
  DashboardCardsSkeleton,
  DeviceGroupChartSkeleton,
  ClassChartSkeleton,
  TimeSeriesChartSkeleton,
  GpsMapChartSkeleton,
  RecentParticipantsTableSkeleton,
} from "./_components/loading-skeletons";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export default async function DashboardPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({ domain }),
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
    trpc.participants.getByDomain.queryOptions({ domain }),
  ]);

  return (
    <HydrateClient>
      <div className="container mx-auto p-6 space-y-6 ">
        <Suspense fallback={<DashboardCardsSkeleton />}>
          <DashboardCards />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<DeviceGroupChartSkeleton />}>
            <DeviceGroupChart />
          </Suspense>

          <Suspense fallback={<ClassChartSkeleton />}>
            <ClassChart />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<TimeSeriesChartSkeleton />}>
            <TimeSeriesChart />
          </Suspense>
          <Suspense fallback={<GpsMapChartSkeleton />}>
            <GpsMapChart />
          </Suspense>
        </div>

        <Suspense fallback={<RecentParticipantsTableSkeleton />}>
          <RecentParticipantsTable />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
