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
import { Separator } from "@vimmer/ui/components/separator";

export default function SidebarLinks() {
  const { domain } = useParams();
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.includes(url);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Marathon</SidebarGroupLabel>
        <SidebarMenu>
          {NAV_LINKS.marathon.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link href={`/${domain}${item.url}`}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <Separator className="group-data-[collapsible=icon]:block hidden" />
      <SidebarGroup>
        <SidebarGroupLabel>Configuration</SidebarGroupLabel>
        <SidebarMenu>
          {NAV_LINKS.configuration.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
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
