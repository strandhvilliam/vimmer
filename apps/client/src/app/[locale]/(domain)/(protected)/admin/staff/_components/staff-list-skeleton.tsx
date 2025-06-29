import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Search } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";

export function StaffListSkeleton() {
  return (
    <>
      <div className="relative mx-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled
        />
      </div>
      <div className="space-y-0.5 p-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="block w-full p-4 rounded-md">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
