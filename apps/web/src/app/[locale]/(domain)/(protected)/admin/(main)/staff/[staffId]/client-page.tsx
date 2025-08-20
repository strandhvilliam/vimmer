"use client";

import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Button } from "@vimmer/ui/components/button";
import { Mail, Trash2, User2Icon, RefreshCw } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vimmer/ui/components/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@vimmer/ui/components/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { format } from "date-fns";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ParticipantVerification,
  Participant,
  ValidationResult,
  CompetitionClass,
  DeviceGroup,
} from "@vimmer/api/db/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

interface StaffDetailsClientProps {
  staffId: string;
}

type VerificationWithParticipant = ParticipantVerification & {
  participant: Participant & {
    validationResults: ValidationResult[];
    competitionClass: CompetitionClass | null;
    deviceGroup: DeviceGroup | null;
  };
};

const columnHelper = createColumnHelper<VerificationWithParticipant>();

const columns = [
  columnHelper.accessor(
    (row) => `${row.participant.firstname} ${row.participant.lastname}`,
    {
      id: "participantName",
      header: "Participant",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor("participant.reference", {
    header: "Number",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("participant.competitionClass.name", {
    header: "Competition Class",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("notes", {
    header: "Notes",
    cell: (info) => {
      const notes = info.getValue();
      if (!notes) return "—";

      const truncatedNotes =
        notes.length > 50 ? `${notes.substring(0, 50)}...` : notes;

      if (notes.length <= 50) {
        return <span>{notes}</span>;
      }

      return (
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-left hover:text-blue-600 cursor-pointer">
              {truncatedNotes}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Full Note</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Accepted At",
    cell: (info) => format(new Date(info.getValue()), "MMM d, yyyy HH:mm"),
  }),
];

export function StaffDetailsClient({ staffId }: StaffDetailsClientProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: staff } = useSuspenseQuery(
    trpc.users.getStaffMemberById.queryOptions({
      staffId,
      domain,
    }),
  );

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: verifications } = useSuspenseQuery(
    trpc.validations.getParticipantVerificationsByStaffId.queryOptions({
      staffId,
      domain,
    }),
  );

  const sortedVerifications = verifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.validations.pathKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.users.pathKey(),
        }),
      ]);
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const { mutate: executeRemove, isPending: isRemoving } = useMutation(
    trpc.users.deleteUserMarathonRelation.mutationOptions({
      onError: (error) => {
        toast.error("Failed to remove staff member");
        console.error("Remove error:", error);
      },
      onSuccess: () => {
        toast.success("Staff member removed successfully");
        router.push(`/${domain}/staff`);
      },
      onSettled: () => {
        handleRefresh();
      },
    }),
  );

  const handleRemove = () => {
    if (!marathon) {
      console.error("Marathon not found");
      return;
    }
    executeRemove({ userId: staffId, marathonId: marathon.id });
  };

  const table = useReactTable({
    data: sortedVerifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!staff) {
    return <div>Staff member not found</div>;
  }

  return (
    <>
      <div className="px-8 py-4">
        <div className="flex items-start justify-between bg-background shadow-sm border border-border p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User2Icon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold font-rocgrotesk">
                  {staff.user.name}
                </h2>
                <Badge
                  variant={staff.role === "admin" ? "default" : "secondary"}
                >
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {staff.user.email}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh Participant Verifications
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        <div className="space-y-2">
          <h3 className="text-lg font-rocgrotesk font-semibold">
            Accepted Participants
          </h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {table.getFlatHeaders().map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-background">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-muted-foreground"
                    >
                      No accepted participants yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {table.getPageCount() > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.previousPage();
                    }}
                    aria-disabled={!table.getCanPreviousPage()}
                    className={
                      !table.getCanPreviousPage()
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                {table.getPageCount() > 0 && (
                  <PaginationItem>
                    <PaginationLink>
                      {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.nextPage();
                    }}
                    aria-disabled={!table.getCanNextPage()}
                    className={
                      !table.getCanNextPage()
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </ScrollArea>

      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-rocgrotesk">
              Remove Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staff.user.name} from the staff?
              This action cannot be undone and they will lose access to this
              marathon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove Staff Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
