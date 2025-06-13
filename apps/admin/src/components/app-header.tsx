import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { SidebarTriggerButton } from "./sidebar-trigger-button";
import { MarathonStatusDisplay } from "./marathon-status-display";
import { Button } from "@vimmer/ui/components/button";
import Link from "next/link";

interface AppHeaderProps {
  domain: string;
}

export async function AppHeader({ domain }: AppHeaderProps) {
  const marathon = await getMarathonByDomain(domain);

  const staffSiteUrl =
    process.env.NODE_ENV === "production"
      ? `https://${domain}.pmuploader.com/staff`
      : `http://localhost:3000/staff`;

  const participantSiteUrl =
    process.env.NODE_ENV === "production"
      ? `https://${domain}.pmuploader.com`
      : `http://localhost:3000`;

  return (
    <div className="z-50 w-full px-4 bg-sidebar">
      <div className="flex h-14 items-center">
        <SidebarTriggerButton />
        <div className="flex gap-2 ml-4">
          <Button asChild variant="outline" size="sm">
            <Link href={staffSiteUrl}>Staff Page</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={participantSiteUrl}>Participant Page</Link>
          </Button>
        </div>
        <div className="flex-1" />
        <MarathonStatusDisplay
          marathonStartDate={marathon?.startDate}
          marathonEndDate={marathon?.endDate}
          isSetupComplete={true}
        />
      </div>
    </div>
  );
}
