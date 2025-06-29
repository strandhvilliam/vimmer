import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Card, CardContent, CardFooter } from "@vimmer/ui/components/card";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="relative">
                  <Skeleton className="aspect-[4/3] w-full" />
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Skeleton className="h-5 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
