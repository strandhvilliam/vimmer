"use client";
"use no memo";

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
  Filter,
  Search,
  AlertOctagon,
  LucideIcon,
  User,
  Mail,
  Book,
  Tag,
  Hash,
  RefreshCw,
  Clock,
  ShieldAlert,
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@vimmer/ui/components/dropdown-menu";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isSameDay } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@vimmer/ui/components/pagination";
import { useDomain } from "@/contexts/domain-context";
import {
  CompetitionClass,
  DeviceGroup,
  Participant,
  ValidationResult,
  ZippedSubmission,
} from "@vimmer/api/db/types";

import { Icon } from "@iconify/react/dist/iconify.js";

type TableRowParticipant = Participant & {
  validationResults: ValidationResult[];
  competitionClass?: CompetitionClass | null;
  deviceGroup?: DeviceGroup | null;
  zippedSubmissions?: ZippedSubmission[];
};

const columnHelper = createColumnHelper<TableRowParticipant>();

const columnInfoMap: Record<string, { label: string; icon: LucideIcon }> = {
  reference: { label: "Participant", icon: Hash },
  email: { label: "Email", icon: Mail },
  status: { label: "Status", icon: Tag },
  name: { label: "Name", icon: User },
  competitionClass: { label: "Class", icon: Book },
  deviceGroup: { label: "Device", icon: Smartphone },
  issues: { label: "Issues", icon: AlertTriangle },
  createdAt: { label: "Submitted At", icon: Clock },
};

const columns = [
  columnHelper.accessor("reference", {
    id: "reference",
    header: "Participant",
    cell: (info) => info.getValue(),
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor((row) => `${row.firstname} ${row.lastname}`, {
    id: "name",
    header: "Name",
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

      const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
          case "verified":
            return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
          case "uploaded":
            return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
          case "rejected":
            return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
          case "ready_to_upload":
            return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
        }
      };

      return (
        <Badge variant="outline" className={getStatusStyle(status)}>
          {status}
        </Badge>
      );
    },
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: "Created",
    cell: (info) => {
      const date = info.getValue();
      try {
        if (!isSameDay(new Date(), new Date(date))) {
          return format(new Date(date), "dd/MM/yyyy HH:mm");
        }

        return formatDistanceToNow(new Date(date), {
          addSuffix: true,
        });
      } catch {
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
  columnHelper.accessor((row) => row.deviceGroup, {
    id: "deviceGroup",
    header: "Device",
    cell: (data) => {
      const deviceGroup = data?.getValue();

      const getDeviceIcon = (icon: string | undefined) => {
        switch (icon) {
          case "smartphone":
            return (
              <Icon
                icon="solar:smartphone-broken"
                className="w-4 h-4"
                style={{ transform: "rotate(-5deg)" }}
              />
            );
          case "camera":
          default:
            return (
              <Icon
                icon="solar:camera-minimalistic-broken"
                className="w-4 h-4"
                style={{ transform: "rotate(-5deg)" }}
              />
            );
        }
      };
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{getDeviceIcon(deviceGroup?.icon)}</TooltipTrigger>
            <TooltipContent>{deviceGroup?.name || "Unknown"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor(
    (row) => ({
      status: row.status,
      zippedSubmission: row.zippedSubmissions,
      validationResults: row.validationResults || [],
    }),
    {
      id: "issues",
      header: "Issues",
      cell: (info) => {
        const { validationResults, zippedSubmission, status } = info.getValue();
        if (!validationResults.length) return null;

        const failedResults = validationResults.filter(
          (result) => result.outcome === "failed",
        );

        if (failedResults.length === 0 && zippedSubmission?.[0]?.zipKey) {
          return null;
        }

        const errorCount = failedResults.filter(
          (result) => result.severity === "error",
        ).length;
        const warningCount = failedResults.filter(
          (result) => result.severity === "warning",
        ).length;

        const isMissingZip =
          !zippedSubmission?.[0]?.zipKey && status === "verified";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  {errorCount > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertOctagon className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        {errorCount}
                      </span>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-500">
                        {warningCount}
                      </span>
                    </div>
                  )}
                  {isMissingZip && (
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  {isMissingZip && (
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="font-semibold text-blue-500">
                        Missing Zip.
                      </p>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        This participant is missing a zip file. Please init a
                        generation.
                      </span>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="font-semibold text-destructive">Errors:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {failedResults
                          .filter((result) => result.severity === "error")
                          .map((error, i) => (
                            <li key={i} className="text-xs ">
                              {error.message || "Unknown error"}
                              {error.fileName && (
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                  File: {error.fileName}
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="font-semibold text-yellow-500">Warnings:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {failedResults
                          .filter((result) => result.severity === "warning")
                          .map((warning, i) => (
                            <li key={i} className="text-sm">
                              {warning.message || "Unknown warning"}
                              {warning.fileName && (
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                  File: {warning.fileName}
                                </span>
                              )}
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
        // Sort by failed validation count
        const failedA =
          rowA.original.validationResults?.filter(
            (result) => result.outcome === "failed",
          ).length || 0;
        const failedB =
          rowB.original.validationResults?.filter(
            (result) => result.outcome === "failed",
          ).length || 0;

        if (failedA !== failedB) return failedA - failedB;

        // If same number of failed validations, sort by error count
        const errorsA =
          rowA.original.validationResults?.filter(
            (result) =>
              result.outcome === "failed" && result.severity === "error",
          ).length || 0;
        const errorsB =
          rowB.original.validationResults?.filter(
            (result) =>
              result.outcome === "failed" && result.severity === "error",
          ).length || 0;

        if (errorsA !== errorsB) return errorsA - errorsB;

        // If same number of errors, sort by warning count
        const warningsA =
          rowA.original.validationResults?.filter(
            (result) =>
              result.outcome === "failed" && result.severity === "warning",
          ).length || 0;
        const warningsB =
          rowB.original.validationResults?.filter(
            (result) =>
              result.outcome === "failed" && result.severity === "warning",
          ).length || 0;

        return warningsA - warningsB;
      },
    },
  ),
];

interface SubmissionsParticipantsTableProps {
  participants: TableRowParticipant[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  searchTerm: string;
  statusFilters: string[];
  classFilters: number[];
  deviceFilters: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onStatusFiltersChange: (filters: string[]) => void;
  onClassFiltersChange: (filters: number[]) => void;
  onDeviceFiltersChange: (filters: number[]) => void;
}

export function SubmissionsParticipantsTable({
  participants,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  searchTerm,
  statusFilters,
  classFilters,
  deviceFilters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusFiltersChange,
  onClassFiltersChange,
  onDeviceFiltersChange,
}: SubmissionsParticipantsTableProps) {
  const { domain } = useDomain();
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [issueFilters, setIssueFilters] = useState<string[]>([]);

  // Fetch competition classes and device groups for filter options
  const { data: competitionClasses = [] } = useQuery(
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
  );
  const { data: deviceGroups = [] } = useQuery(
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
  );

  // Get unique values for filters from current participants data
  const uniqueStatuses = Array.from(
    new Set(participants.map((p) => p.status).filter(Boolean)),
  );

  const issueTypes = ["Has Errors", "Has Warnings", "No Issues"];

  // Filter participants by issue type (client-side since this requires validation results analysis)
  const filteredData = useMemo(() => {
    if (issueFilters.length === 0) {
      return participants;
    }

    return participants.filter((participant) => {
      const failedResults =
        participant.validationResults?.filter((r) => r.outcome === "failed") ||
        [];
      const hasErrors = failedResults.some((r) => r.severity === "error");
      const hasWarnings = failedResults.some((r) => r.severity === "warning");
      const hasNoIssues = failedResults.length === 0;

      return issueFilters.some((filter) => {
        if (filter === "Has Errors" && hasErrors) return true;
        if (filter === "Has Warnings" && hasWarnings && !hasErrors) return true;
        if (filter === "No Issues" && hasNoIssues) return true;
        return false;
      });
    });
  }, [participants, issueFilters]);

  const activeFilterCount =
    statusFilters.length +
    classFilters.length +
    deviceFilters.length +
    issueFilters.length;

  const clearAllFilters = () => {
    onStatusFiltersChange([]);
    onClassFiltersChange([]);
    onDeviceFiltersChange([]);
    setIssueFilters([]);
  };

  const toggleStatusFilter = (status: string) => {
    const newFilters = statusFilters.includes(status)
      ? statusFilters.filter((s) => s !== status)
      : [...statusFilters, status];
    onStatusFiltersChange(newFilters);
  };

  const toggleClassFilter = (classId: number) => {
    const newFilters = classFilters.includes(classId)
      ? classFilters.filter((c) => c !== classId)
      : [...classFilters, classId];
    onClassFiltersChange(newFilters);
  };

  const toggleDeviceFilter = (deviceId: number) => {
    const newFilters = deviceFilters.includes(deviceId)
      ? deviceFilters.filter((d) => d !== deviceId)
      : [...deviceFilters, deviceId];
    onDeviceFiltersChange(newFilters);
  };

  const toggleIssueFilter = (issueType: string) => {
    setIssueFilters((prev) =>
      prev.includes(issueType)
        ? prev.filter((i) => i !== issueType)
        : [...prev, issueType],
    );
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: trpc.participants.getByDomainPaginated.queryOptions({
          domain,
          page: 1,
          pageSize: 10,
          search: undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        }).queryKey,
      });
    } catch (error) {
      console.error("Error refreshing participants data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    // Use external pagination
    manualPagination: true,
    pageCount: totalPages,
  });

  const getColumnDisplayName = (columnId: string): string => {
    const columnInfo = columnInfoMap[columnId];
    return columnInfo ? columnInfo.label : columnId;
  };

  const getColumnIcon = (columnId: string): React.ReactNode => {
    const columnInfo = columnInfoMap[columnId];
    return columnInfo ? <columnInfo.icon className="h-3.5 w-3.5" /> : null;
  };

  const handleRowClick = (row: TableRowParticipant) => {
    router.push(`/admin/submissions/${row.reference}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg shadow-sm flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {uniqueStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Class</DropdownMenuLabel>
              {competitionClasses.map((competitionClass) => (
                <DropdownMenuCheckboxItem
                  key={competitionClass.id}
                  checked={classFilters.includes(competitionClass.id)}
                  onCheckedChange={() => toggleClassFilter(competitionClass.id)}
                >
                  {competitionClass.name}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Device</DropdownMenuLabel>
              {deviceGroups.map((deviceGroup) => (
                <DropdownMenuCheckboxItem
                  key={deviceGroup.id}
                  checked={deviceFilters.includes(deviceGroup.id)}
                  onCheckedChange={() => toggleDeviceFilter(deviceGroup.id)}
                >
                  {deviceGroup.name}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Issues</DropdownMenuLabel>
              {issueTypes.map((issueType) => (
                <DropdownMenuCheckboxItem
                  key={issueType}
                  checked={issueFilters.includes(issueType)}
                  onCheckedChange={() => toggleIssueFilter(issueType)}
                >
                  {issueType}
                </DropdownMenuCheckboxItem>
              ))}

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearAllFilters}>
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-background">
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className="font-medium text-muted-foreground h-10 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
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
                  className="cursor-pointer hover:bg-muted/50 bg-background"
                  onClick={() => handleRowClick(row.original)}
                >
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
                  className="h-24 text-center bg-background"
                >
                  No submissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            entries
          </span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 ? onPageChange(currentPage - 1) : undefined
                }
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {totalPages > 0 &&
              Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => onPageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (
                    (pageNumber === 2 && currentPage >= 4) ||
                    (pageNumber === totalPages - 1 &&
                      currentPage <= totalPages - 3)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                },
              )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages
                    ? onPageChange(currentPage + 1)
                    : undefined
                }
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = Number(e.target.value);
              onPageSizeChange(newPageSize);
              // Reset to first page when changing page size
              onPageChange(1);
            }}
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
