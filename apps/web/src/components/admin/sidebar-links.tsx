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
import Link from "next/link";
import { Separator } from "@vimmer/ui/components/separator";

import {
  LayoutDashboard,
  Images,
  Bell,
  Shield,
  ListCheck,
  BookOpen,
  Settings,
  LucideIcon,
  Tag,
  File,
  Trophy,
  Heart,
} from "lucide-react";

export const NAV_LINKS = {
  marathon: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard as LucideIcon,
    },
    {
      name: "Submissions",
      url: "/submissions",
      icon: Images as LucideIcon,
    },
    {
      name: "Alerts",
      url: "/alerts",
      icon: Bell as LucideIcon,
    },
    {
      name: "Export",
      url: "/export",
      icon: File as LucideIcon,
    },
    {
      name: "Jury",
      url: "/jury",
      icon: Trophy as LucideIcon,
    },
  ],
  configuration: [
    {
      name: "Topics",
      url: "/topics",
      icon: Tag as LucideIcon,
    },
    {
      name: "Staff",
      url: "/staff",
      icon: Shield as LucideIcon,
    },
    {
      name: "Classes",
      url: "/classes",
      icon: ListCheck as LucideIcon,
    },
    {
      name: "Rules",
      url: "/rules",
      icon: BookOpen as LucideIcon,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: Settings as LucideIcon,
    },
    {
      name: "Sponsors",
      url: "/sponsors",
      icon: Heart as LucideIcon,
    },
  ],
} as const;

export default function SidebarLinks() {
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
                <Link prefetch={true} href={`/admin/${item.url}`}>
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
                <Link prefetch={true} href={`/admin/${item.url}`}>
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
