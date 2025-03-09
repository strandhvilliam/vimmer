import { getMarathonWithConfigByDomain } from "@vimmer/supabase/cached-queries";
import { SidebarTriggerButton } from "./sidebar-trigger-button";
import { MarathonStatusDisplay } from "./marathon-status-display";

interface AppHeaderProps {
  domain: string;
}

export async function AppHeader({ domain }: AppHeaderProps) {
  const marathon = await getMarathonWithConfigByDomain(domain);

  return (
    <div className="z-50 w-full border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <SidebarTriggerButton />
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
