"use client";

import { format } from "date-fns";
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
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  UserRound,
  Users,
  RefreshCw,
} from "lucide-react";
import { use } from "react";
import { useDashboardData } from "../dashboard-context";
import { useParams } from "next/navigation";
import { refreshParticipantsData } from "../_actions/refresh-participants";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

export function RecentParticipantsTable() {
  const { locale, domain } = useParams();
  const { participantsPromise } = useDashboardData();
  const participants = use(participantsPromise);

  const { execute, isExecuting } = useAction(refreshParticipantsData, {
    onSuccess: () => {
      toast.success("Participants data refreshed successfully");
      // Refresh the page to get the updated data
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Failed to refresh participants data");
      console.error("Refresh error:", error);
    },
  });

  const recentParticipants = participants
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  const handleRefresh = () => {
    execute({ domain: domain as string });
  };

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
          <button
            onClick={handleRefresh}
            disabled={isExecuting}
            className="p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-50"
            title="Refresh participants data"
          >
            <RefreshCw
              className={`h-4 w-4 text-muted-foreground ${
                isExecuting ? "animate-spin" : ""
              }`}
            />
          </button>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Reference</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentParticipants.map((participant) => (
                <TableRow key={participant.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <Link
                      href={`/${locale}/${domain}/submissions/${participant.reference}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{participant.reference}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span>{`${participant.firstname} ${participant.lastname}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {participant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {participant.validationResults &&
                    participant.validationResults.length > 0 ? (
                      <div className="flex items-center gap-2">
                        {participant.validationResults.filter(
                          (r) =>
                            r.severity === "error" && r.outcome === "failed"
                        ).length > 0 && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            {
                              participant.validationResults.filter(
                                (r) =>
                                  r.severity === "error" &&
                                  r.outcome === "failed"
                              ).length
                            }
                          </Badge>
                        )}
                        {participant.validationResults.filter(
                          (r) =>
                            r.severity === "warning" && r.outcome === "failed"
                        ).length > 0 && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-amber-500 text-amber-500"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {
                              participant.validationResults.filter(
                                (r) =>
                                  r.severity === "warning" &&
                                  r.outcome === "failed"
                              ).length
                            }
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href={`/${locale}/${domain}/submissions`}
            className="text-sm text-primary hover:underline hover:text-primary/80 flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            <span>View all participants</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
