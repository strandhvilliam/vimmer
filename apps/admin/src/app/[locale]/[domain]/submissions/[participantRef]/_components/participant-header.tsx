"use client";

import { ArrowLeft, Camera, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@vimmer/ui/components/button";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
} from "@vimmer/supabase/types";
import { useParams } from "next/navigation";

interface ParticipantHeaderProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
}

export function ParticipantHeader({ participant }: ParticipantHeaderProps) {
  const { domain } = useParams();
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/${domain}/submissions`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
            {`${participant.firstname} ${participant.lastname}`}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Participant #{participant.reference}</span>
          <span>•</span>
          <span>{participant?.competitionClass?.name || "No class"}</span>
          <span>•</span>
          <span>{participant?.deviceGroup?.name || "No device group"}</span>
        </div>
      </div>
    </div>
  );
}
