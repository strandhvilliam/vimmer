"use client";

import * as React from "react";
import { ChevronsUpDown, Frame, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { Button } from "@vimmer/ui/components/button";
import { SidebarMenuButton, useSidebar } from "@vimmer/ui/components/sidebar";
import { useSession } from "@/hooks/use-session";
import { Marathon } from "@vimmer/api/db/types";

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
  const router = useRouter();
  const [hasImageError, setHasImageError] = React.useState(false);

  const activeMarathon = marathons.find(
    (marathon) => marathon.domain === activeDomain
  );

  const handleImageError = () => {
    setHasImageError(true);
  };

  const handleImageLoad = () => {
    setHasImageError(false);
  };

  const handleSwitchMarathon = () => {
    router.push("/select-domain");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {activeMarathon?.logoUrl && !hasImageError ? (
              // eslint-disable-next-line @next/next/no-img-element
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
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        {activeMarathon ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {activeMarathon.logoUrl && !hasImageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeMarathon.logoUrl}
                    alt="Marathon logo"
                    className="size-8"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <Frame className="size-8" />
                )}
              </div>
              <div>
                <h3 className="font-rocgrotesk text-lg font-semibold">
                  {activeMarathon.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeMarathon.domain}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {activeMarathon.description && (
                <p className="text-sm text-muted-foreground">
                  {activeMarathon.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4" />
                <span>
                  {activeMarathon.startDate
                    ? new Date(activeMarathon.startDate).toLocaleDateString()
                    : "Date not set"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4" />
                <span>Domain: {activeMarathon.domain}</span>
              </div>
            </div>

            <Button onClick={handleSwitchMarathon} className="w-full">
              Switch Marathon
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No marathon selected
            </p>
            <Button onClick={handleSwitchMarathon} className="mt-2">
              Select Marathon
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
