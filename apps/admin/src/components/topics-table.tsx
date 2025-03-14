"use client";

import { Topic } from "@vimmer/supabase/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Row,
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
import { CSSProperties, useEffect, useRef, useState } from "react";
import React from "react";

import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  GripVertical,
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
import { useSortable } from "@dnd-kit/react/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";
import { cn } from "@vimmer/ui/lib/utils";

interface DragHandleProps {
  row: Row<Topic>;
  index: number;
}

function DragHandle({ row, index }: DragHandleProps) {
  const dragRef = useRef(null);
  const { ref } = useSortable({
    id: row.original.id,
    index,
    handle: dragRef,
  });

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <button
        ref={dragRef}
        className="flex items-center cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="font-medium text-center w-6">
        {row.original.orderIndex}
      </div>
    </div>
  );
}

interface TopicsTableProps {
  topics: Topic[];
  onTopicsChange: (newTopics: Topic[]) => void;
  isLoading?: boolean;
}

interface SortableRowProps {
  row: Row<Topic>;
  index: number;
  children: React.ReactNode;
}

function SortableRow({ row, index, children }: SortableRowProps) {
  const { ref, isDragging } = useSortable({
    id: row.original.id,
    index,
  });

  return (
    <TableRow
      className={cn(isDragging ? "bg-muted/50" : "bg-background")}
      ref={ref}
    >
      {children}
    </TableRow>
  );
}

export function TopicsTable({
  topics,
  onTopicsChange,
  isLoading,
}: TopicsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [data, setData] = useState<Topic[]>(topics);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = data.findIndex((topic) => topic.id === active.id);
    const newIndex = data.findIndex((topic) => topic.id === over.id);

    const newData = arrayMove(data, oldIndex, newIndex).map((topic, index) => ({
      ...topic,
      orderIndex: index,
    }));

    setData(newData);
    onTopicsChange(newData);
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

    // onTopicsChange(updatedTopics);
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
    // onTopicsChange(updatedTopics);
    setEditDialogOpen(false);
    setSelectedTopic(null);
  };

  const columns: ColumnDef<Topic>[] = [
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => {
        return <DragHandle row={row} index={row.index} />;
      },
    },
    {
      accessorKey: "name",
      header: "Topic",
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
                    console.log("Show submissions for topic", row.id);
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
    data,
    columns,
    getRowId: (row) => row.orderIndex.toString(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-md border relative",
            isLoading && "opacity-50 pointer-events-none"
          )}
        >
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                <SortableContext
                  items={data.map((topic) => topic.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <SortableRow
                      key={row.original.id}
                      row={row}
                      index={row.index}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </SortableRow>
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
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
