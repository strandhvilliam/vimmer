import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";

export function LoginFormSkeleton() {
  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="pt-6 space-y-6">
        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Login button */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
