import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function LoginFormSkeleton() {
  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
