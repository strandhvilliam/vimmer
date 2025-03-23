"use client";

import { Button } from "@vimmer/ui/components/button";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@vimmer/ui/components/sidebar";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
export function SidebarTriggerButton() {
  return (
    <SidebarTrigger>
      <Button variant="ghost" size="icon" className="mr-4">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </SidebarTrigger>
  );
}
