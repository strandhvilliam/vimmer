"use client";

import { NAVIGATION_ITEMS } from "@/lib/constants";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@vimmer/ui/components/breadcrumb";
import { usePathname } from "next/navigation";

export default function CurrentPageHeader() {
  const pathname = usePathname();
  const title = NAVIGATION_ITEMS.find((item) => item.url === pathname)?.title;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{title || ""}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
