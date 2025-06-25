"use client";

import * as React from "react";
import { ChevronsUpDown, Frame, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@vimmer/ui/components/sidebar";
import { Marathon } from "@vimmer/supabase/types";
import { useSession } from "@/lib/hooks/use-session";
import { selectDomain } from "@/lib/actions/select-domain";
import { useAction } from "next-safe-action/hooks";

interface DomainSwitcherProps {
  marathons: Marathon[];
  activeDomain: string | undefined;
}

export function DomainSwitchDropdown({
  marathons,
  activeDomain,
}: DomainSwitcherProps) {
  const { isMobile } = useSidebar();
  const { user } = useSession();
  const [hasImageError, setHasImageError] = React.useState(false);

  const { execute } = useAction(selectDomain);

  const activeMarathon = marathons.find(
    (marathon) => marathon.domain === activeDomain
  );

  const handleImageError = () => {
    setHasImageError(true);
  };

  const handleImageLoad = () => {
    setHasImageError(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {activeMarathon?.logoUrl && !hasImageError ? (
              <img
                src={activeMarathon.logoUrl}
                alt="Marathon logo"
                className="size-4"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <Frame className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {activeMarathon?.name}
            </span>
            <span className="truncate text-xs">{user?.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Domains
        </DropdownMenuLabel>
        {marathons.map((marathon) => (
          <DropdownMenuItem
            key={marathon.id}
            className="gap-2 p-2"
            onClick={() => execute({ domain: marathon.domain })}
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              <Frame className="size-4 shrink-0" />
            </div>
            <span className="truncate font-semibold">{marathon.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
