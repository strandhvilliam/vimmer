import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Separator } from "@vimmer/ui/components/separator";

export function LoginFormSkeleton() {
  return (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="relative py-2">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="flex items-center justify-center space-x-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
