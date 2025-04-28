import { DashboardCards } from "./_components/dashboard-cards";
import { RecentParticipantsTable } from "./_components/recent-participants-table";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getParticipantsByDomain,
} from "@vimmer/supabase/cached-queries";
import { TimeSeriesChart } from "./_components/time-series-chart";
import { GpsMapChart } from "./_components/gps-map-chart";
import { DeviceGroupChart } from "./_components/device-group-chart";
import { ClassChart } from "./_components/class-chart";
import { DashboardProvider } from "./dashboard-context";
import { Suspense } from "react";
import {
  DashboardCardsSkeleton,
  DeviceGroupChartSkeleton,
  ClassChartSkeleton,
  TimeSeriesChartSkeleton,
  GpsMapChartSkeleton,
  RecentParticipantsTableSkeleton,
} from "./_components/loading-skeletons";

interface PageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { domain } = await params;

  const deviceGroupsPromise = getDeviceGroupsByDomain(domain);
  const competitionClassesPromise = getCompetitionClassesByDomain(domain);
  const participantsPromise = getParticipantsByDomain(domain);

  return (
    <DashboardProvider
      competitionClassesPromise={competitionClassesPromise}
      deviceGroupsPromise={deviceGroupsPromise}
      participantsPromise={participantsPromise}
    >
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
    </DashboardProvider>
  );
}
