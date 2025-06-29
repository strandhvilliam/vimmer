"use client";
import { Plus } from "lucide-react";
import { CreateInvitationSheet } from "./create-invitation-sheet";
import { useState } from "react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { DeviceGroup, Marathon, Topic } from "@vimmer/supabase/types";
import { CompetitionClass } from "@vimmer/supabase/types";

export function CreateInvitationButton({
  competitionClassesPromise,
  topicsPromise,
  marathonPromise,
  deviceGroupsPromise,
}: {
  competitionClassesPromise: Promise<CompetitionClass[]>;
  topicsPromise: Promise<Topic[]>;
  marathonPromise: Promise<Marathon | null>;
  deviceGroupsPromise: Promise<DeviceGroup[]>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        New
      </PrimaryButton>
      <CreateInvitationSheet
        open={open}
        onOpenChange={setOpen}
        competitionClassesPromise={competitionClassesPromise}
        marathonPromise={marathonPromise}
        topicsPromise={topicsPromise}
        deviceGroupsPromise={deviceGroupsPromise}
      />
    </>
  );
}
