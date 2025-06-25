"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ValidationResult } from "@vimmer/supabase/types";
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

// Extended type to include extracted orderIndex
type ValidationResultWithOrder = ValidationResult & {
  extractedOrderIndex: number | null;
};

interface ValidationResultsTableProps {
  validationResults: ValidationResult[];
}

// Function to extract order index from fileName
function extractOrderIndexFromFileName(fileName: string): number | null {
  // Parse the S3 key format: domain/participantRef/orderIndex/fileName
  const parts = fileName.split("/");
  if (parts.length >= 3 && parts[2]) {
    // orderIndex is the third part in the path
    return parseInt(parts[2], 10);
  }

  // Alternative format: try to get from filename pattern (e.g. 1234_01.jpg)
  const matches = fileName.match(/_(\d+)\./);
  if (matches && matches[1]) {
    return parseInt(matches[1], 10);
  }

  return null;
}

const columnHelper = createColumnHelper<ValidationResultWithOrder>();

const columns = [
  // Add order index column
  columnHelper.accessor("extractedOrderIndex", {
    header: "Submission #",
    cell: (info) => {
      const orderIndex = info.getValue();
      return orderIndex !== null ? orderIndex : "—";
    },
    size: 120,
    sortingFn: (a, b) => {
      const aOrder = a.original.extractedOrderIndex ?? Infinity;
      const bOrder = b.original.extractedOrderIndex ?? Infinity;
      return aOrder - bOrder;
    },
  }),
  columnHelper.accessor("outcome", {
    header: "Status",
    cell: (info) => {
      const outcome = info.getValue();

      if (outcome === "passed") {
        return (
          <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/20">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Passed
          </Badge>
        );
      } else {
        return (
          <Badge
            className={cn(
              info.row.original.severity === "error"
                ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
                : "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"
            )}
          >
            {info.row.original.severity === "error" ? (
              <XCircle className="h-3.5 w-3.5 mr-1" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            )}
            {info.row.original.severity === "error" ? "Error" : "Warning"}
          </Badge>
        );
      }
    },
    size: 120,
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("fileName", {
    header: "File",
    cell: (info) => info.getValue() || "Global",
    size: 200,
  }),
  columnHelper.accessor("severity", {
    header: "Severity",
    cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    size: 120,
  }),
  columnHelper.accessor("ruleKey", {
    header: "Rule",
    cell: (info) => info.getValue(),
    size: 150,
  }),
];

export function ValidationResultsTable({
  validationResults,
}: ValidationResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "extractedOrderIndex", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Process validation results to extract order index
  const resultsWithOrderIndex = validationResults.map((result) => {
    let extractedOrderIndex: number | null = null;

    if (result.fileName) {
      extractedOrderIndex = extractOrderIndexFromFileName(
        result.fileName as string
      );
    }

    return {
      ...result,
      extractedOrderIndex,
    };
  });

  const table = useReactTable({
    data: resultsWithOrderIndex,
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
    initialState: {
      sorting: [{ id: "extractedOrderIndex", desc: false }],
    },
  });

  if (validationResults.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No validation results available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
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
                  data-state={row.getIsSelected() && "selected"}
                  className="bg-background"
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
              <TableRow className="bg-background">
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
    </div>
  );
}
