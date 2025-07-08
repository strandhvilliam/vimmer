"use client";

import { RefreshCw, Trash2 } from "lucide-react";
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
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { deleteJuryInvitationAction } from "../../../../../../../../lib/actions/send-jury-invitation-email";
import { useDomain } from "@/contexts/domain-context";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface InvitationOptionsProps {
  invitationId: number;
}

export function InvitationOptions({ invitationId }: InvitationOptionsProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const { domain } = useDomain();

  const { data: invitation } = useSuspenseQuery(
    trpc.jury.getJuryInvitationById.queryOptions({
      id: invitationId,
    })
  );

  const { execute: deleteInvitation, isExecuting: isDeleting } = useAction(
    deleteJuryInvitationAction,
    {
      onSuccess: () => {
        toast({
          title: "Invitation deleted",
          description: "Jury invitation has been deleted successfully",
        });
        router.push(`/${domain}/jury`);
      },
      onError: (error) => {
        console.log("error", error);
        toast({
          title: "Error",
          description: error.error.serverError || "Failed to delete invitation",
          variant: "destructive",
        });
      },
    }
  );

  const handleResendInvitation = () => {
    toast({
      title: "Invitation resent",
      description: `Jury invitation resent to ${invitation?.email}`,
    });
  };

  const handleDeleteInvitation = () => {
    deleteInvitation({ invitationId });
  };

  return (
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
              {invitation?.email}? This action cannot be undone.
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
  );
}
