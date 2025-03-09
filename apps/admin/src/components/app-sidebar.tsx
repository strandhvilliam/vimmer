import {
  Sidebar,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
} from "@vimmer/ui/components/sidebar";
import SidebarLinks from "./sidebar-links";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { getUserMarathons } from "@vimmer/supabase/cached-queries";
import { NavUser } from "./nav-user";
import { DomainSwitchDropdown } from "./domain-switch-dropdown";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export async function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <Suspense fallback={<SidebarTopSkeleton />}>
        <SidebarTop />
      </Suspense>
      <SidebarContent>
        <SidebarLinks />
      </SidebarContent>
      <Suspense fallback={<SidebarBottomSkeleton />}>
        <SidebarBottom />
      </Suspense>
    </Sidebar>
  );
}

async function SidebarTop() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const marathons = await getUserMarathons(session.user.id);
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DomainSwitchDropdown marathons={marathons} />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

async function SidebarBottom() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <NavUser user={session.user} />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

//TODO: Make better skeleton
async function SidebarBottomSkeleton() {
  return (
    <SidebarFooter>
      <Skeleton className="h-12 w-full" />
    </SidebarFooter>
  );
}

//TODO: Make better skeleton
async function SidebarTopSkeleton() {
  return (
    <SidebarHeader>
      <Skeleton className="h-12 w-full" />
    </SidebarHeader>
  );
}
