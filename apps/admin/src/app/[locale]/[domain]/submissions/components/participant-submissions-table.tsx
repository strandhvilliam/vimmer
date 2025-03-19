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
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@vimmer/ui/components/badge";
import { AlertTriangle, Smartphone, Camera } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";

interface Participant {
  id: number;
  participantNumber: string;
  name: string;
  uploadStatus: "complete" | "incomplete" | "not_started";
  competitionClass: string;
  device: "smartphone" | "camera";
  warnings: string[];
  errors: string[];
}

const MOCK_DATA: Participant[] = [
  {
    id: 1,
    participantNumber: "P001",
    name: "Alice Smith",
    uploadStatus: "complete",
    competitionClass: "Marathon",
    device: "smartphone",
    warnings: ["Image size too small"],
    errors: [],
  },
  {
    id: 2,
    participantNumber: "P002",
    name: "Bob Johnson",
    uploadStatus: "incomplete",
    competitionClass: "Sprint",
    device: "camera",
    warnings: [],
    errors: ["Missing EXIF data"],
  },
];

const columnHelper = createColumnHelper<Participant>();

const columns = [
  columnHelper.accessor("participantNumber", {
    header: "Number",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("uploadStatus", {
    header: "Upload Status",
    cell: (info) => {
      const status = info.getValue();
      const variants = {
        complete: "default",
        incomplete: "secondary",
        not_started: "outline",
      } as const;

      const labels = {
        complete: "Complete",
        incomplete: "Incomplete",
        not_started: "Not Started",
      };

      return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    },
  }),
  columnHelper.accessor("competitionClass", {
    header: "Class",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("device", {
    header: "Device",
    cell: (info) => {
      const device = info.getValue();
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {device === "smartphone" ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {device === "smartphone" ? "Smartphone" : "Camera"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
  columnHelper.accessor(
    (row) => ({ warnings: row.warnings, errors: row.errors }),
    {
      id: "issues",
      header: "Issues",
      cell: (info) => {
        const { warnings, errors } = info.getValue();
        const hasIssues = warnings.length > 0 || errors.length > 0;

        if (!hasIssues) return null;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <AlertTriangle
                    className={`h-4 w-4 ${errors.length > 0 ? "text-destructive" : "text-yellow-500"}`}
                  />
                  <span className="text-sm">
                    {warnings.length + errors.length}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  {errors.length > 0 && (
                    <div>
                      <p className="font-semibold text-destructive">Errors:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {errors.map((error, i) => (
                          <li key={i} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div>
                      <p className="font-semibold text-yellow-500">Warnings:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {warnings.map((warning, i) => (
                          <li key={i} className="text-sm">
                            {warning}
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
    }
  ),
];

export function ParticipantSubmissionsTable() {
  const router = useRouter();

  const table = useReactTable({
    data: MOCK_DATA,
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
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  router.push(`/dev0/submissions/${row.original.id}`)
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No submissions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
