import { Card } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function DomainSelectSkeleton() {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col gap-3 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex flex-row items-center p-4 w-full">
            <div className="flex flex-col w-full gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32 ml-auto" />
          </Card>
        ))}
      </div>
    </div>
  );
}
