import { SearchIcon } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function JuryInvitationsListSkeleton() {
  return (
    <>
      <div className="relative mx-2">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invitations..."
          className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled
        />
      </div>
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-5 w-1/4 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
