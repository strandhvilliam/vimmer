import { Skeleton } from "@vimmer/ui/components/skeleton";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";

export function StaffDetailsSkeleton() {
  return (
    <>
      {/* Header Section */}
      <div className="px-8 py-4">
        <div className="flex items-start justify-between bg-background shadow-sm border border-border p-4 rounded-lg">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {/* Name */}
                <Skeleton className="h-6 w-32" />
                {/* Badge */}
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {/* Email */}
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            {/* Action buttons */}
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Participants Table Section */}
      <ScrollArea className="flex-1 p-8">
        <div className="space-y-2">
          {/* Table title */}
          <Skeleton className="h-6 w-48" />
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {/* Table headers */}
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-background">
                {/* Table rows */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
