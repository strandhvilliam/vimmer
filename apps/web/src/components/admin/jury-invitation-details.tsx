"use client";

import React from "react";
import { RefreshCw, Trash2, Mail } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@vimmer/ui/components/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@vimmer/ui/components/table";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useDomain } from "@/contexts/domain-context";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { JuryStatusBadge } from "@/components/admin/jury-status-badge";
import { JuryInvitationNotFound } from "@/components/admin/jury-invitation-not-found";

interface JuryInvitationDetailsProps {
  invitationId: number;
}

export function JuryInvitationDetails({
  invitationId,
}: JuryInvitationDetailsProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();

  const { data: invitation } = useSuspenseQuery(
    trpc.jury.getJuryInvitationById.queryOptions({
      id: invitationId,
    }),
  );
  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
  );
  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );
  const { data: deviceGroups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
  );

  const { mutate: deleteInvitation, isPending: isDeleting } = useMutation(
    trpc.jury.deleteJuryInvitation.mutationOptions({
      onSuccess: () => {
        toast({
          title: "Invitation deleted",
          description: "Jury invitation has been deleted successfully",
        });
      },
      onError: (error) => {
        console.log("error", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete invitation",
          variant: "destructive",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.jury.pathKey(),
        });
      },
    }),
  );

  const handleResendInvitation = () => {
    toast({
      title: "Not implemented",
      description: `Jury invitation resend is not implemented yet`,
    });
  };

  const handleDeleteInvitation = () => {
    deleteInvitation({ id: invitationId });
  };

  const className = competitionClasses.find(
    (c) => c.id === invitation?.competitionClassId,
  );
  const deviceGroup = deviceGroups.find(
    (g) => g.id === invitation?.deviceGroupId,
  );
  const topic = topics.find((t) => t.id === invitation?.topicId);

  if (!invitation) {
    return <JuryInvitationNotFound />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-rocgrotesk">Jury Invitation</h1>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleResendInvitation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Jury Invitation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the jury invitation for{" "}
                  {invitation.email}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteInvitation}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            {invitation.email}
          </CardTitle>
          <CardDescription>
            Invitation sent on{" "}
            {new Date(invitation.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h3>
              <JuryStatusBadge status={invitation.status} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Expiration
              </h3>
              <p>{new Date(invitation.expiresAt).toLocaleDateString()}</p>
            </div>

            {invitation.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Notes
                </h3>
                <p className="text-sm">{invitation.notes}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Submission Filters
              </h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Competition Class
                    </TableCell>
                    <TableCell>{className?.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Device Group</TableCell>
                    <TableCell>{deviceGroup?.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Topic</TableCell>
                    <TableCell>{topic?.name}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Token:{" "}
            <code className="bg-muted p-1 rounded">
              {invitation.token.substring(0, 16)}...
            </code>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
