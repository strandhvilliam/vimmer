import { format } from "date-fns";
import { DashboardCards } from "./_components/dashboard-cards";
import { DashboardCharts } from "./_components/dashboard-charts";
import { RecentParticipantsTable } from "./_components/recent-participants-table";
import { generateMockData } from "./_utils/mock-data";
import { connection } from "next/server";
import {
  getCompetitionClassesByDomain,
  getDeviceGroupsByDomain,
  getMarathonByDomain,
  getParticipantByReference,
  getParticipantsByDomain,
} from "@vimmer/supabase/cached-queries";
import { Participant, ParticipantStatus } from "@vimmer/supabase/types";
import {
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "@vimmer/validation/constants";

interface PageProps {
  params: Promise<{
    domain: string;
    locale: string;
  }>;
}

export default async function DashboardPage({ params }: PageProps) {
  await connection();
  const { domain, locale } = await params;

  const [participants, deviceGroups, competitionClasses] = await Promise.all([
    getParticipantsByDomain(domain),
    getDeviceGroupsByDomain(domain),
    getCompetitionClassesByDomain(domain),
  ]);

  const totalParticipants = participants.length;
  const totalUploads = participants.reduce(
    (sum: number, p: Participant) => sum + p.uploadCount,
    0
  );

  const statusCounts = participants.reduce(
    (acc: Record<string, number>, p: Participant) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<ParticipantStatus, number>
  );

  const deviceGroupStats = deviceGroups.map((group) => ({
    name: group.name,
    value: participants.filter((p) => p.deviceGroupId === group.id).length,
  }));

  const classStats = competitionClasses.map((cls) => ({
    name: cls.name,
    value: participants.filter((p) => p.competitionClassId === cls.id).length,
  }));

  const participantsByDate = participants.reduce(
    (acc: Record<string, number>, p: Participant) => {
      const date = format(new Date(p.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const timeSeriesData = Object.entries(participantsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const validationIssues = participants.flatMap(
    (p) => p.validationResults || []
  );
  const errorCount = validationIssues.filter(
    (v) =>
      v.severity === SEVERITY_LEVELS.ERROR &&
      v.outcome === VALIDATION_OUTCOME.FAILED
  ).length;
  const warningCount = validationIssues.filter(
    (v) =>
      v.severity === SEVERITY_LEVELS.WARNING &&
      v.outcome === VALIDATION_OUTCOME.FAILED
  ).length;

  const recentParticipants = [...participants]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="container mx-auto p-6 space-y-6 ">
      <DashboardCards
        totalParticipants={totalParticipants}
        totalUploads={totalUploads}
        statusCounts={statusCounts}
        errorCount={errorCount}
        warningCount={warningCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCharts
          chartType="deviceGroup"
          timeSeriesData={timeSeriesData}
          deviceGroupStats={deviceGroupStats}
          classStats={classStats}
          statusCounts={statusCounts}
        />
        <DashboardCharts
          chartType="class"
          timeSeriesData={timeSeriesData}
          deviceGroupStats={deviceGroupStats}
          classStats={classStats}
          statusCounts={statusCounts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCharts
          chartType="timeSeries"
          timeSeriesData={timeSeriesData}
          deviceGroupStats={deviceGroupStats}
          classStats={classStats}
          statusCounts={statusCounts}
        />
        <DashboardCharts
          chartType="gpsMap"
          timeSeriesData={timeSeriesData}
          deviceGroupStats={deviceGroupStats}
          classStats={classStats}
          statusCounts={statusCounts}
        />
      </div>

      <RecentParticipantsTable
        participants={recentParticipants}
        locale={locale}
        domain={domain}
      />
    </div>
  );
}
