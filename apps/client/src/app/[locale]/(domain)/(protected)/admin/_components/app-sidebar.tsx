import {
  Sidebar,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarFooter,
} from "@vimmer/ui/components/sidebar";
import SidebarLinks from "./sidebar-links";
import { Suspense } from "react";
import { NavUser } from "./nav-user";
import {
  AppSidebarHeader,
  AppSidebarHeaderSkeleton,
} from "./app-sidebar-header";

export async function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-none bg-sidebar z-20">
      <Suspense fallback={<AppSidebarHeaderSkeleton />}>
        <AppSidebarHeader />
      </Suspense>
      <SidebarContent>
        <SidebarLinks />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
