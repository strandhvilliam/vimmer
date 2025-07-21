import React from "react";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@vimmer/ui/components/card";

export function JuryInvitationDetailsSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="border rounded-md">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex border-b last:border-b-0">
                    <div className="p-4 font-medium flex-1">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="p-4 flex-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-64" />
        </CardFooter>
      </Card>
    </div>
  );
}
