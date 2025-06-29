import { getSession } from "@/lib/auth";
import { getUserMarathons } from "@vimmer/supabase/cached-queries";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@vimmer/ui/components/sidebar";
import { DomainSwitchDropdown } from "./domain-switch-dropdown";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { cookies } from "next/headers";

export async function AppSidebarHeader() {
  const session = await getSession();
  const cookieStore = await cookies();
  const domain = cookieStore.get("activeDomain")?.value;
  if (!session) {
    return null;
  }

  const marathons = await getUserMarathons(session.user.id);
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DomainSwitchDropdown marathons={marathons} activeDomain={domain} />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export async function AppSidebarHeaderSkeleton() {
  return (
    <SidebarHeader>
      <Skeleton className="h-12 w-full" />
    </SidebarHeader>
  );
}
