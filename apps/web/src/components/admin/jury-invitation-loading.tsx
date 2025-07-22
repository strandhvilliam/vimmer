import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Card, CardHeader, CardContent } from "@vimmer/ui/components/card";

export function JuryInvitationLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
