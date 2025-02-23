import { QrCode, Scroll } from "lucide-react";

export const NAVIGATION_ITEMS = [
  {
    title: "Verification",
    url: "/verification",
    icon: QrCode,
  },
  {
    title: "History",
    url: "/history",
    icon: Scroll,
  },
] as const;
