import React from "react";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="w-full">
        <div className="container pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container h-full py-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="space-y-4 bg-background">
                <div className="rounded-md border relative">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">
                          <Skeleton className="h-4 w-12" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <Skeleton className="h-4 w-14" />
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {/* Order/Drag Handle Column */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-6" />
                            </div>
                          </TableCell>

                          {/* Topic Name Column */}
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>

                          {/* Submissions Column */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-6" />
                              <Skeleton className="h-3 w-3" />
                            </div>
                          </TableCell>

                          {/* Status Column */}
                          <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
