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
    submission: "vimmer-production-submissionbucketbucket-hrwhxroc",
    thumbnail: "vimmer-production-thumbnailbucketbucket-mnhotfat",
    preview: "vimmer-production-previewbucketbucket-fxomuscf",
    exports: "vimmer-production-exportsbucketbucket-fobbmezf",
    marathonSettings: "vimmer-production-marathonsettingsbucketbucket-vvfcxahn",
  },
  routers: {
    clientApp: "d7jju76wxmf4s.cloudfront.net",
    adminApp: "d2jz7yvn1nbs3f.cloudfront.net",
    submissions: "d1dhqfyvq5mda8.cloudfront.net",
    previews: "d16igxxn0uyqhb.cloudfront.net",
    settings: "d1sjxktpbba8ly.cloudfront.net",
    thumbnails: "d1lrb35a2ku1ol.cloudfront.net",
  },
} as const;
