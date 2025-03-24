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
  Calendar,
  LucideIcon,
  User,
  Mail,
  Book,
  Tag,
  Hash,
  RefreshCw,
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
import { format } from "date-fns";
import { refreshParticipantsData } from "../_actions/refresh-participants-data";

type ParticipantWithValidationErrors = Participant & {
  validationErrors: ValidationError[];
  competitionClass?: {
    id: number;
    name: string;
  } | null;
  deviceGroup?: {
    id: number;
    name: string;
  } | null;
};

const columnHelper = createColumnHelper<ParticipantWithValidationErrors>();

const columnInfoMap: Record<string, { label: string; icon: LucideIcon }> = {
  reference: { label: "Participant", icon: Hash },
  email: { label: "Email", icon: Mail },
  status: { label: "Status", icon: Tag },
  competitionClass: { label: "Class", icon: Book },
  deviceGroup: { label: "Device", icon: Smartphone },
  issues: { label: "Issues", icon: AlertTriangle },
  createdAt: { label: "Registered", icon: Calendar },
};

const columns = [
  columnHelper.accessor("reference", {
    id: "reference",
    header: "Participant",
    cell: (info) => info.getValue(),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("email", {
    id: "email",
    header: "Email",
    cell: (info) => info.getValue() || "-",
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue();

      return <Badge variant="secondary">{status}</Badge>;
    },
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: "Created",
    cell: (info) => {
      const date = info.getValue();
      try {
        return format(new Date(date), "dd/MM/yyyy HH:mm");
      } catch (error) {
        return date || "-";
      }
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.createdAt).getTime();
      const dateB = new Date(rowB.original.createdAt).getTime();
      return dateA - dateB;
    },
  }),
  columnHelper.accessor((row) => row.competitionClass?.name, {
    id: "competitionClass",
    header: "Class",
    cell: (info) => info.getValue() || "-",
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor((row) => row.deviceGroup?.name, {
    id: "deviceGroup",
    header: "Device",
    cell: (info) => {
      const deviceName = info.getValue();
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {deviceName ? (
                <Camera className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>{deviceName || "Smartphone"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    sortingFn: "alphanumeric",
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
    sortingFn: (rowA, rowB) => {
      const errorsA = rowA.original.validationErrors?.length || 0;
      const errorsB = rowB.original.validationErrors?.length || 0;
      return errorsA - errorsB;
    },
  }),
];

interface SubmissionsParticipantsTableProps {
  participants: ParticipantWithValidationErrors[];
  domain: string;
}

export function SubmissionsParticipantsTable({
  participants,
  domain,
}: SubmissionsParticipantsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "reference", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshParticipantsData();
      router.refresh();
    } catch (error) {
      console.error("Error refreshing participants data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    const columnInfo = columnInfoMap[columnId];
    return columnInfo ? columnInfo.label : columnId;
  };

  const getColumnIcon = (columnId: string): React.ReactNode => {
    const columnInfo = columnInfoMap[columnId];
    return columnInfo ? <columnInfo.icon className="h-3.5 w-3.5" /> : null;
  };

  const handleRowClick = (row: ParticipantWithValidationErrors) => {
    router.push(`/${row.domain}/submissions/${row.reference}`);
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
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg shadow-sm flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-lg shadow-sm">
                Sort by:{" "}
                {sorting.length > 0 && sorting[0]?.id ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{getColumnIcon(sorting[0].id)}</span>
                    {getColumnDisplayName(sorting[0].id)}
                  </div>
                ) : (
                  <span>Default</span>
                )}{" "}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => {
                if (!column.id) return null;

                return (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() =>
                      column.id && setSorting([{ id: column.id, desc: false }])
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span>{getColumnIcon(column.id)}</span>
                      {getColumnDisplayName(column.id)}
                    </div>
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
                  className="font-medium text-muted-foreground h-10 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
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
                  onClick={() => handleRowClick(row.original)}
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
