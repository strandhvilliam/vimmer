"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useRouter } from "next/navigation";

interface InvitationOptionsProps {
  invitationId: number;
  email: string;
}

export function InvitationOptions({
  invitationId,
  email,
}: InvitationOptionsProps) {
  const router = useRouter();

  const handleResendInvitation = () => {
    toast({
      title: "Invitation resent",
      description: `Jury invitation resent to ${email}`,
    });
  };

  const handleDeleteInvitation = () => {
    toast({
      title: "Invitation deleted",
      description: "Jury invitation has been deleted",
    });
    router.push("/jury");
  };

  return (
    <div className="space-x-2">
      <Button variant="outline" size="sm" onClick={handleResendInvitation}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Resend
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDeleteInvitation}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}
