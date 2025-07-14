"use client";

import { Skeleton } from "@vimmer/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { Users, UploadCloud, AlertCircle, Hourglass } from "lucide-react";

// Dashboard Cards Skeleton
export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="bg-background">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-28" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="px-4">
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

// Device Group Chart Skeleton
export function DeviceGroupChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          <Skeleton className="h-5 w-36" />
        </CardTitle>
        <CardDescription className="text-xs">
          <Skeleton className="h-3 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center">
          <Skeleton className="h-[140px] w-[140px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Class Chart Skeleton
export function ClassChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <CardDescription className="text-xs">
          <Skeleton className="h-3 w-44" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center">
          <Skeleton className="h-[140px] w-[140px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Time Series Chart Skeleton
export function TimeSeriesChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          <Skeleton className="h-5 w-40" />
        </CardTitle>
        <CardDescription className="text-xs">
          <Skeleton className="h-3 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-[160px] w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// GPS Map Chart Skeleton
export function GpsMapChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <CardDescription className="text-xs">
          <Skeleton className="h-3 w-44" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-[160px] w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// Recent Participants Table Skeleton
export function RecentParticipantsTableSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-rocgrotesk">
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription className="text-xs">
            <Skeleton className="h-3 w-64" />
          </CardDescription>
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="w-[200px]">
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead className="w-[120px]">
                  <Skeleton className="h-4 w-14" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-10 rounded-full" />
                        <Skeleton className="h-6 w-10 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-4 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}
