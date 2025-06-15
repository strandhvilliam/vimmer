import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { SidebarTriggerButton } from "./sidebar-trigger-button";
import { MarathonStatusDisplay } from "./marathon-status-display";
import { Button } from "@vimmer/ui/components/button";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Separator } from "@vimmer/ui/components/separator";
import { AWS_CONFIG } from "@/lib/constants";

interface AppHeaderProps {
  domain: string;
}

export async function AppHeader({ domain }: AppHeaderProps) {
  const marathon = await getMarathonByDomain(domain);

  const staffSiteUrl = `${AWS_CONFIG.routers.clientApp}/staff`;
  const participantSiteUrl = `${AWS_CONFIG.routers.clientApp}`;

  return (
    <div className="z-50 w-full px-4 bg-sidebar">
      <div className="flex h-14 items-center">
        <SidebarTriggerButton />
        <div className="flex gap-2 ml-auto mr-4 border bg-sidebar-accent rounded-md items-center">
          <Button asChild variant="ghost" size="sm">
            <Link href={staffSiteUrl} className="font-normal text-sm">
              <LinkIcon className="w-4 h-4" />
              Staff Page
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4 bg-foreground" />
          <Button asChild variant="ghost" size="sm">
            <Link href={participantSiteUrl} className="font-normal text-sm">
              <LinkIcon className="w-4 h-4" />
              Participant Page
            </Link>
          </Button>
        </div>
        <MarathonStatusDisplay
          marathonStartDate={marathon?.startDate}
          marathonEndDate={marathon?.endDate}
          isSetupComplete={true}
        />
      </div>
    </div>
  );
}
