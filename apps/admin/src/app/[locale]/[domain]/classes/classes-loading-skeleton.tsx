import { Card } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function ClassesLoadingSkeleton() {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-5 w-full max-w-2xl mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative">
            <div className="flex flex-col gap-2 p-4">
              <div className="flex h-fit items-center w-fit justify-between bg-muted rounded-lg shadow-sm border p-2">
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center px-4 pb-4 gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
