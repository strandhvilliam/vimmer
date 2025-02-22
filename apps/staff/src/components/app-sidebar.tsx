"use client";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@vimmer/ui/components/sidebar";
import { Command } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { NavUser } from "./nav-user";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="overflow-hidden ">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="md:h-8 md:p-0">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Acme Inc</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {NAVIGATION_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => {
                      router.push(item.url);
                      toggleSidebar();
                    }}
                    isActive={pathname === item.url}
                    className="px-2.5 md:px-2"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: "shadcn",
            email: "demo@demo.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
