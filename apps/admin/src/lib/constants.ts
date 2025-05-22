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
  Trophy,
} from "lucide-react";

export const NAV_LINKS = {
  marathon: [
    {
      name: "Dashboard",
      url: "/",
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

export const EXPORT_KEYS = {
  ZIP_PREVIEWS: "zip_previews",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_SUBMISSIONS: "zip_submissions",
  EXIF: "exif",
  XLSX_PARTICIPANTS: "xlsx_participants",
  XLSX_SUBMISSIONS: "xlsx_submissions",
} as const;

export const AWS_CONFIG = {
  region: "eu-north-1",
  buckets: {
    submission: "vimmer-development-submissionbucketbucket-mssednck",
    thumbnail: "vimmer-development-thumbnailbucketbucket-mssednck",
    preview: "vimmer-development-previewbucketbucket-mssednck",
    exports: "vimmer-development-exportsbucketbucket-wdhoedum",
  },
} as const;
