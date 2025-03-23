import {
  LayoutDashboard,
  RadioTower,
  Images,
  Bell,
  Users,
  Shield,
  ListCheck,
  BookOpen,
  Settings,
  LucideIcon,
  Tag,
  File,
} from "lucide-react";

export const NAV_LINKS = {
  marathon: [
    {
      name: "Dashboard",
      url: "/",
      icon: LayoutDashboard as LucideIcon,
    },
    {
      name: "Live View",
      url: "/live",
      icon: RadioTower as LucideIcon,
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
  ],
  configuration: [
    {
      name: "Participants",
      url: "/participants",
      icon: Users as LucideIcon,
    },
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
  ],
} as const;
