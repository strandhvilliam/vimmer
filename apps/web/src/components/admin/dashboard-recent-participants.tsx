"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { useTRPC } from "@/trpc/client";
import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Participant, ValidationResult } from "@vimmer/api/db/types";

function getInitials(firstname: string, lastname: string) {
  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
}

function getValidationCounts(validationResults: ValidationResult[]) {
  const errors = validationResults.filter(
    (r) => r.severity === "error" && r.outcome === "failed",
  ).length;
  const warnings = validationResults.filter(
    (r) => r.severity === "warning" && r.outcome === "failed",
  ).length;
  return { errors, warnings };
}

function StatusIndicator({ status }: { status: string }) {
  const statusConfig = {
    initialized: { color: "bg-gray-500", label: "Initialized" },
    ready_to_upload: { color: "bg-blue-500", label: "Ready to Upload" },
    processing: { color: "bg-violet-500", label: "Processing" },
    error: { color: "bg-red-500", label: "Error" },
    completed: { color: "bg-amber-500", label: "Completed" },
    verified: { color: "bg-emerald-500", label: "Verified" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: "bg-gray-500",
    label: status,
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-sm font-medium capitalize">{config.label}</span>
    </div>
  );
}

interface ParticipantRowProps {
  participant: Participant & { validationResults: ValidationResult[] };
}

function ParticipantRow({ participant }: ParticipantRowProps) {
  const { errors, warnings } = getValidationCounts(
    participant.validationResults || [],
  );

  return (
    <>
      {/* Desktop Table Row */}
      <TableRow className="hover:bg-muted/30 hidden md:table-row">
        <TableCell className="font-medium">
          <Link
            href={`/admin/submissions/${participant.reference}`}
            className="text-primary hover:underline flex items-center gap-1 transition-colors"
          >
            <span>{participant.reference}</span>
          </Link>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(participant.firstname, participant.lastname)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {`${participant.firstname} ${participant.lastname}`}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(participant.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <StatusIndicator status={participant.status} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {errors > 0 && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1 text-xs"
              >
                <AlertCircle className="h-3 w-3" />
                {errors}
              </Badge>
            )}
            {warnings > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-amber-500 text-amber-600 text-xs"
              >
                <AlertTriangle className="h-3 w-3" />
                {warnings}
              </Badge>
            )}
            {errors === 0 && warnings === 0 && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Mobile Card */}
      <TableRow className="md:hidden">
        <TableCell colSpan={4} className="p-0">
          <Link
            href={`/admin/submissions/${participant.reference}`}
            className="block p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-medium">
                      {getInitials(participant.firstname, participant.lastname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {`${participant.firstname} ${participant.lastname}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      #{participant.reference}
                    </div>
                  </div>
                </div>
                <StatusIndicator status={participant.status} />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(participant.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <div className="flex items-center gap-2">
                  {errors > 0 && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1 text-xs"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors}
                    </Badge>
                  )}
                  {warnings > 0 && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-amber-500 text-amber-600 text-xs"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {warnings}
                    </Badge>
                  )}
                  {errors === 0 && warnings === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        </TableCell>
      </TableRow>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardRecentParticipants() {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomain.queryOptions({ domain }),
  );

  const recentParticipants = participants
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const handleRefresh = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.participants.pathKey(),
      });
    });
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-rocgrotesk">
              Participant Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Most recently registered participants and submission status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-rocgrotesk">
            Participant Activity
          </CardTitle>
          <CardDescription className="text-sm">
            Most recently registered participants and submission status
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2 hover:bg-muted rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
            title="Refresh participants data"
          >
            <RefreshCw
              className={`h-4 w-4 text-muted-foreground ${
                isPending ? "animate-spin" : ""
              }`}
            />
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">
              {recentParticipants.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
              No participants yet
            </h3>
            <p className="text-sm text-muted-foreground/80">
              Participants will appear here once they register
            </p>
          </div>
        ) : (
          <>
            <div className="border-b">
              <Table>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[120px] font-medium">
                      Reference
                    </TableHead>
                    <TableHead className="font-medium">Participant</TableHead>
                    <TableHead className="w-[140px] font-medium">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] font-medium">
                      Issues
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentParticipants.map((participant) => (
                    <ParticipantRow
                      key={participant.id}
                      participant={participant}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-muted/20 border-t">
              <Link
                href={`/admin/submissions`}
                className="text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-2 transition-colors group"
              >
                <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">View all participants</span>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
