import React from "react";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

export function JurySidebarSkeleton() {
  return (
    <div className="w-80 border-r flex flex-col bg-background">
      <div className="pt-4 space-y-4 bg-background">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold font-rocgrotesk">
            Jury Invitations
          </h2>
          <PrimaryButton disabled>
            <Plus className="h-4 w-4 mr-1" />
            New
          </PrimaryButton>
        </div>
        <div className="relative mx-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invitations..."
            className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled
          />
        </div>
        <ScrollArea className="flex-1 bg-background">
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="block w-full p-2 text-left rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
