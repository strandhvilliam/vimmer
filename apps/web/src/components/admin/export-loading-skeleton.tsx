import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export function ExportLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 flex justify-between w-full items-center">
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-6 w-64" />
              </div>
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-72" />
              <div className="bg-muted/50 border border-muted rounded-md p-3 w-fit">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-48 mt-1" />
              </div>
            </div>
            <div className="flex items-center ml-auto">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-44" />
                </div>
                <Skeleton className="h-4 w-80" />
                <Skeleton className="h-4 w-68" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-4 w-76" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
