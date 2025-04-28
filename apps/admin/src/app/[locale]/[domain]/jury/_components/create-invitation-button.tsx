"use client";
import { Plus } from "lucide-react";
import { CreateInvitationSheet } from "./create-invitation-sheet";
import { useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

export function CreateInvitationButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        New
      </PrimaryButton>
      <CreateInvitationSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
