import { DashboardCards } from "@/components/admin/dashboard-cards";
import { DashboardRecentParticipants } from "@/components/admin/dashboard-recent-participants";
import { DashboardTimeSeriesChart } from "@/components/admin/dashboard-time-series-chart";
import { DashboardGpsMapChart } from "@/components/admin/dashboard-gps-map-chart";
import { DeviceGroupChart } from "@/components/admin/device-group-chart";
import { DashboardClassChart } from "@/components/admin/dashboard-class-chart";
import { Suspense } from "react";
import {
  DashboardCardsSkeleton,
  DeviceGroupChartSkeleton,
  ClassChartSkeleton,
  TimeSeriesChartSkeleton,
  GpsMapChartSkeleton,
  RecentParticipantsTableSkeleton,
} from "@/components/admin/loading-skeletons";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  redirect("/admin/submissions");
  // const domain = await getDomain()

  // // batchPrefetch([
  // //   trpc.marathons.getByDomain.queryOptions({ domain }),
  // //   trpc.competitionClasses.getByDomain.queryOptions({ domain }),
  // //   trpc.deviceGroups.getByDomain.queryOptions({ domain }),
  // //   trpc.participants.getByDomainPaginated.queryOptions({
  // //     domain,
  // //     page: 1,
  // //     pageSize: 10,
  // //     sortBy: "createdAt",
  // //     sortOrder: "desc",
  // //   }),
  // // ])

  // return (
  //   <HydrateClient>
  //     <div className="container mx-auto p-6 space-y-6 ">
  //       <Suspense fallback={<DashboardCardsSkeleton />}>
  //         {/* <DashboardCards /> */}
  //       </Suspense>

  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //         <Suspense fallback={<DeviceGroupChartSkeleton />}>
  //           {/* <DeviceGroupChart /> */}
  //         </Suspense>

  //         <Suspense fallback={<ClassChartSkeleton />}>
  //           <DashboardClassChart />
  //         </Suspense>
  //       </div>

  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //         <Suspense fallback={<TimeSeriesChartSkeleton />}>
  //           {/* <DashboardTimeSeriesChart /> */}
  //         </Suspense>
  //         <Suspense fallback={<GpsMapChartSkeleton />}>
  //           <DashboardGpsMapChart />
  //         </Suspense>
  //       </div>

  //       <Suspense fallback={<RecentParticipantsTableSkeleton />}>
  //         {/* <DashboardRecentParticipants /> */}
  //       </Suspense>
  //     </div>
  //   </HydrateClient>
  // )
}
