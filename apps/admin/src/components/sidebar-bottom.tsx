import { SidebarFooter } from "@vimmer/ui/components/sidebar";
import React from "react";
import { NavUser } from "./nav-user";
import { getSession } from "@/lib/auth";

export default async function SidebarBottom() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return (
    <SidebarFooter>
      <NavUser user={session.user} />
    </SidebarFooter>
  );
}
