import { auth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@vimmer/ui/components/sidebar";
import { headers } from "next/headers";
import SidebarLinks from "./sidebar-links";
import { DomainSwitcher } from "./domain-switch-popup";
import { getMarathonsByUserId } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { NavUser } from "./nav-user";

export async function AppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const supabase = await createClient();
  const marathonsPromise = getMarathonsByUserId(supabase, session.user.id);
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DomainSwitcher marathonsPromise={marathonsPromise} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarLinks />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
