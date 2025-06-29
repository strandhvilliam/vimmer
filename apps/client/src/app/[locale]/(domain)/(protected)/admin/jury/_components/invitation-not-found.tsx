"use client";

import { useRouter } from "next/navigation";

interface InvitationNotFoundProps {
  onClick?: () => void;
}

export function InvitationNotFound({ onClick }: InvitationNotFoundProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push("/jury");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Invitation not found</h2>
        <p className="text-muted-foreground mb-6">
          The jury invitation you're looking for doesn't exist or has been
          deleted.
        </p>
      </div>
    </div>
  );
}
