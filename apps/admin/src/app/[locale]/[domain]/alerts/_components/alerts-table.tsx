"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ValidationResult } from "@vimmer/supabase/types";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { Badge } from "@vimmer/ui/components/badge";
import { cn } from "@vimmer/ui/lib/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

interface ValidationAlertWithParticipant extends ValidationResult {
  participantName: string;
  participantReference: string;
}

interface AlertsTableProps {
  alerts: ValidationAlertWithParticipant[];
}

const columnHelper = createColumnHelper<ValidationAlertWithParticipant>();

export function AlertsTable({ alerts }: AlertsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "severity", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = [
    columnHelper.accessor("severity", {
      header: "Severity",
      cell: (info) => {
        const severity = info.getValue();
        return (
          <Badge
            className={cn(
              severity === "error"
                ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
                : "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"
            )}
          >
            {severity === "error" ? (
              <XCircle className="h-3.5 w-3.5 mr-1" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            )}
            <span className="capitalize">{severity}</span>
          </Badge>
        );
      },
      size: 120,
    }),
    columnHelper.accessor("participantName", {
      header: "Participant",
      cell: (info) => info.getValue(),
      size: 200,
    }),
    columnHelper.accessor("message", {
      header: "Message",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ruleKey", {
      header: "Rule",
      cell: (info) => info.getValue(),
      size: 150,
    }),
    columnHelper.accessor("fileName", {
      header: "File",
      cell: (info) => info.getValue() || "Global",
      size: 180,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      },
      size: 180,
    }),
  ];

  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No validation issues found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none text-muted-foreground h-10 font-medium"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `submissions/${row.original.participantReference}`
                    )
                  }
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        {alerts.length} {alerts.length === 1 ? "issue" : "issues"} found
      </div>
    </div>
  );
}
