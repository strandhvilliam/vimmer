"use client";

import { Topic } from "@vimmer/supabase/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  Images,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Dialog, DialogTrigger } from "@vimmer/ui/components/dialog";
import { Badge } from "@vimmer/ui/components/badge";
import { TopicsEditDialog } from "./topics-edit-dialog";
import { DeleteTopicDialog } from "./topics-delete-dialog";

interface TopicsTableProps {
  topics: Topic[];
  onTopicsChange: (topics: Topic[], isOrderChange?: boolean) => void;
}

export function TopicsTable({ topics, onTopicsChange }: TopicsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;

    const newTopics = [...topics];
    [newTopics[index - 1], newTopics[index]] = [
      newTopics[index]!,
      newTopics[index - 1]!,
    ];

    const updatedTopics = newTopics.map((topic, idx) => ({
      ...topic,
      orderIndex: idx,
    }));

    onTopicsChange(updatedTopics, true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= topics.length - 1) return;

    const newTopics = [...topics];
    [newTopics[index], newTopics[index + 1]] = [
      newTopics[index + 1]!,
      newTopics[index]!,
    ];

    const updatedTopics = newTopics.map((topic, idx) => ({
      ...topic,
      orderIndex: idx,
    }));

    onTopicsChange(updatedTopics, true);
  };

  const handleDeleteClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (topic: Topic) => {
    const updatedTopics = topics
      .filter((t) => t.id !== topic.id)
      .map((t, idx) => ({
        ...t,
        orderIndex: idx,
      }));

    onTopicsChange(updatedTopics);
    setDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleEditClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditDialogOpen(true);
  };

  const handleEditSave = (updatedTopic: Topic) => {
    const updatedTopics = topics.map((t) =>
      t.id === updatedTopic.id ? updatedTopic : t
    );

    onTopicsChange(updatedTopics);
    setEditDialogOpen(false);
    setSelectedTopic(null);
  };

  const columns: ColumnDef<Topic>[] = [
    {
      id: "reorderAndIndex",
      header: "Order",
      cell: ({ row }) => {
        const index = row.index;
        return (
          <div className="flex items-center gap-6">
            <div className="font-medium text-center w-6">
              {row.original.orderIndex + 1}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={index === topics.length - 1}
                onClick={() => handleMoveDown(index)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            Topic
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const topic = row.original;
        return <div className="font-medium">{topic.name}</div>;
      },
    },
    {
      id: "submissions",
      header: "Submissions",
      cell: ({ row }) => {
        const count = row.original.orderIndex + 1 * 10;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-8 hover:bg-accent group"
                  onClick={() => {
                    console.log("Show submissions for topic", row.original.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Images className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{count}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View submissions for this topic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const topic = row.original;
        const isScheduled = !!topic.scheduledStart;
        const isPublic = topic.visibility === "public";

        let status = "Private";
        if (isPublic) {
          status = isScheduled ? "Scheduled" : "Public";
        }

        return (
          <Badge variant={status === "Public" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const topic = row.original;
        // For demo purposes, generate a random number of submissions
        const submissionCount = topic.orderIndex + 1 * 10;

        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(topic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit topic</p>
                </TooltipContent>
              </Tooltip>

              <Dialog
                open={deleteDialogOpen && topic.id === selectedTopic?.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedTopic(null);
                  }
                  setDeleteDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteClick(topic)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  const table = useReactTable({
    data: topics,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "reorderAndIndex", desc: false }],
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
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
                    className="h-24 text-center"
                  >
                    No topics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteTopicDialog
        topic={selectedTopic}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />

      <TopicsEditDialog
        topic={selectedTopic}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditSave}
      />
    </>
  );
}
