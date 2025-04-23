import { format } from "date-fns";
import { DashboardCards } from "./_components/dashboard-cards";
import { RecentParticipantsTable } from "./_components/recent-participants-table";
import { connection } from "next/server";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getParticipantsByDomain,
  getValidationResultsByParticipantId,
} from "@vimmer/supabase/cached-queries";
import { Participant, ParticipantStatus } from "@vimmer/supabase/types";
import {
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "@vimmer/validation/constants";
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
  await connection();
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
