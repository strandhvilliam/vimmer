"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@vimmer/ui/components/sidebar";
import React from "react";
import { useParams, usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import Link from "next/link";

export default function SidebarLinks() {
  const { domain } = useParams();
  const pathname = usePathname();
  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Marathon</SidebarGroupLabel>
        <SidebarMenu>
          {NAV_LINKS.marathon.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
              >
                <Link href={`/${domain}${item.url}`}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Configuration</SidebarGroupLabel>
        <SidebarMenu>
          {NAV_LINKS.configuration.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
              >
                <Link href={`/${domain}${item.url}`}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
