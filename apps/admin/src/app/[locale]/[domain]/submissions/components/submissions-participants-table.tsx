"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Badge } from "@vimmer/ui/components/badge";
import {
  AlertTriangle,
  Smartphone,
  Camera,
  Filter,
  ChevronDown,
  Search,
  AlertCircle,
  AlertOctagon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Input } from "@vimmer/ui/components/input";
import { Button } from "@vimmer/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu";
import { Participant, ValidationError } from "@vimmer/supabase/types";
import { useState } from "react";

const columnHelper = createColumnHelper<
  Participant & { validationErrors: ValidationError[] }
>();

const columnInfoMap: Record<string, string> = {
  reference: "Number",
  email: "Email",
  status: "Status",
  competitionClassId: "Class",
  deviceGroupId: "Device",
  issues: "Issues",
};

const columns = [
  columnHelper.accessor("reference", {
    header: "Number",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const variants = {
        complete: "default",
        incomplete: "secondary",
        not_started: "outline",
      } as const;

      return (
        <Badge
          variant={variants[status as keyof typeof variants] || "secondary"}
        >
          {status}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("competitionClassId", {
    header: "Class",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("deviceGroupId", {
    header: "Device",
    cell: (info) => {
      const deviceId = info.getValue();
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {deviceId ? (
                <Camera className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {deviceId ? "Camera" : "Smartphone"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
  columnHelper.accessor((row) => row.validationErrors || [], {
    id: "issues",
    header: "Issues",
    cell: (info) => {
      const validationErrors = info.getValue();
      if (!validationErrors.length) return null;

      const errorCount = validationErrors.filter(
        (err) => err.severity === "error"
      ).length;
      const warningCount = validationErrors.filter(
        (err) => err.severity === "warning"
      ).length;
      const aiSuspicionCount = validationErrors.filter(
        (err) => err.severity === "ai_suspicion"
      ).length;

      let iconColor = "text-yellow-500";
      let IconComponent = AlertTriangle;

      if (errorCount > 0) {
        iconColor = "text-destructive";
        IconComponent = AlertOctagon;
      } else if (aiSuspicionCount > 0) {
        iconColor = "text-purple-500";
        IconComponent = AlertCircle;
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <IconComponent className={`h-4 w-4 ${iconColor}`} />
                <span className="text-sm">{validationErrors.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                {errorCount > 0 && (
                  <div>
                    <p className="font-semibold text-destructive">Errors:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {validationErrors
                        .filter((err) => err.severity === "error")
                        .map((error, i) => (
                          <li key={i} className="text-sm">
                            {error.message || "Unknown error"}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {warningCount > 0 && (
                  <div>
                    <p className="font-semibold text-yellow-500">Warnings:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {validationErrors
                        .filter((err) => err.severity === "warning")
                        .map((warning, i) => (
                          <li key={i} className="text-sm">
                            {warning.message || "Unknown warning"}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {aiSuspicionCount > 0 && (
                  <div>
                    <p className="font-semibold text-purple-500">
                      AI Suspicions:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {validationErrors
                        .filter((err) => err.severity === "ai_suspicion")
                        .map((suspicion, i) => (
                          <li key={i} className="text-sm">
                            {suspicion.message ||
                              "AI-generated content suspected"}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
];

interface SubmissionsParticipantsTableProps {
  participants: (Participant & { validationErrors: ValidationError[] })[];
}

export function SubmissionsParticipantsTable({
  participants,
}: SubmissionsParticipantsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "reference", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: participants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const getColumnDisplayName = (columnId: string): string => {
    return columnInfoMap[columnId] || columnId;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Input
            placeholder="Search"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 rounded-lg shadow-sm"
          />
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-lg shadow-sm">
                Sort by:{" "}
                {sorting.length > 0 && sorting[0]?.id
                  ? getColumnDisplayName(sorting[0].id)
                  : "Default"}{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() =>
                      column.id && setSorting([{ id: column.id, desc: false }])
                    }
                  >
                    {column.id && getColumnDisplayName(column.id)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg shadow-sm"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className="font-medium text-muted-foreground h-10"
                >
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
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`/dev0/submissions/${row.original.id}`)
                  }
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
                  No submissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
