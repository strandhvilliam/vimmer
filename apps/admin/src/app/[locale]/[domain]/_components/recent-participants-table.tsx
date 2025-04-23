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
} from "lucide-react";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  ValidationResult,
} from "@vimmer/supabase/types";
interface RecentParticipantsTableProps {
  participants: (Participant & {
    validationResults: ValidationResult[];
    deviceGroup: DeviceGroup | null;
    competitionClass: CompetitionClass | null;
  })[];
  locale: string;
  domain: string;
}

export function RecentParticipantsTable({
  participants,
  locale,
  domain,
}: RecentParticipantsTableProps) {
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
        <Users className="h-5 w-5 text-muted-foreground" />
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
              {participants.map((participant) => (
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
