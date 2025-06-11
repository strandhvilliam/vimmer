"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { deleteJuryInvitationAction } from "../_actions/jury-invitation-actions";

interface InvitationOptionsProps {
  invitationId: number;
  email: string;
}

export function InvitationOptions({
  invitationId,
  email,
}: InvitationOptionsProps) {
  const router = useRouter();
  const params = useParams();
  const domain = params.domain as string;

  console.log({ invitationId });

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
      description: `Jury invitation resent to ${email}`,
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
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDeleteInvitation}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
