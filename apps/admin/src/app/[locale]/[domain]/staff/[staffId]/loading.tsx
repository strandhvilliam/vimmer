import { Skeleton } from "@vimmer/ui/components/skeleton";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { Mail, User2Icon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";

export default function StaffDetailsLoading() {
  return (
    <>
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center text-muted-foreground gap-2">
                <Mail className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled>
              Edit
            </Button>
            <Button size="sm" variant="destructive" disabled>
              Remove
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Accepted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
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
