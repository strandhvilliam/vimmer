"use client";
"use no memo";

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
} from "@vimmer/supabase/types";

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
    }
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

interface AcceptedParticipantsTableProps {
  verifications: (ParticipantVerification & {
    participant: Participant & {
      validationResults: ValidationResult[];
      competitionClass: CompetitionClass | null;
      deviceGroup: DeviceGroup | null;
    };
  })[];
}

export function AcceptedParticipantsTable({
  verifications,
}: AcceptedParticipantsTableProps) {
  const table = useReactTable({
    data: verifications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Accepted Participants</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
  );
}
