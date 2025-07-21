import { Card, CardContent, CardHeader } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";

export function OnboardingLoading() {
  return (
    <>
      <DotPattern />
      <div className="min-h-screen bg-gradient-to-br">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-12">
            <ol className="flex items-center mx-auto max-w-4xl">
              {Array.from({ length: 7 }).map((_, index) => (
                <li key={index} className="flex flex-col flex-1">
                  <div className="flex items-center w-full">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                    {index !== 6 && (
                      <div className="flex-1 relative">
                        <Skeleton className="absolute inset-0 mx-3 h-0.5 top-1/2 -translate-y-1/2 rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-4xl mx-auto">
            <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl">
              <CardHeader className="text-center">
                <Skeleton className="h-8 w-64 mx-auto mb-2" />
                <Skeleton className="h-4 w-96 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
