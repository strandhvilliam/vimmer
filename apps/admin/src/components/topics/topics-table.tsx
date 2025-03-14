"use client";

import { Topic } from "@vimmer/supabase/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
  DndContext,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  SortableContext,
} from "@dnd-kit/sortable";
import { useState } from "react";
import React from "react";

import { Edit, ExternalLink, Images, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Badge } from "@vimmer/ui/components/badge";
import { TopicsEditDialog } from "./topics-edit-dialog";
import { DeleteTopicDialog } from "./topics-delete-dialog";
import { cn } from "@vimmer/ui/lib/utils";
import { TopicsDragHandle } from "./topics-drag-handle";
import { TopicsSortableRow } from "./topics-sortable-row";

interface TopicsTableProps {
  topics: Topic[];
  onUpdateTopicsOrder: (newOrdering: number[]) => void;
  onUpdateTopic: (topic: Topic) => void;
  isLoading?: boolean;
}

export function TopicsTable({
  topics,
  onUpdateTopicsOrder,
  onUpdateTopic,
  isLoading,
}: TopicsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    setDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleEditClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditDialogOpen(true);
  };

  const handleEditSave = (updatedTopic: Topic) => {
    onUpdateTopic(updatedTopic);
    setData((data) =>
      data.map((t) => (t.id === updatedTopic.id ? updatedTopic : t))
    );
    setEditDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);
    const newData = arrayMove(data, oldIndex, newIndex);
    setData(newData);
    onUpdateTopicsOrder(newData.map((t) => t.id));
  };

  const [data, setData] = useState(topics);
  const dataIds: UniqueIdentifier[] = data.map((t) => t.id);

  const columns: ColumnDef<Topic>[] = [
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => {
        return (
          <TopicsDragHandle
            id={row.original.id}
            index={row.index}
            dataIds={dataIds}
          />
        );
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
      cell: ({ row }) => <SubmissionsCell row={row} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { scheduledStart, visibility } = row.original;
        const status = scheduledStart
          ? "Scheduled"
          : visibility === "public"
            ? "Public"
            : "Private";
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
      cell: ({ row }) => (
        <TopicActionsCell
          onEditClick={() => handleEditClick(row.original)}
          onDeleteClick={() => handleDeleteClick(row.original)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <div className="space-y-4">
        <div
          className={cn(
            "rounded-md border relative",
            isLoading && "pointer-events-none"
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
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
                  key={dataIds.join(",")}
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <TopicsSortableRow
                      key={row.id}
                      row={row}
                      index={row.original.orderIndex}
                      dataIds={dataIds}
                    />
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

function SubmissionsCell({ row }: { row: Row<Topic> }) {
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
}

function TopicActionsCell({
  onEditClick,
  onDeleteClick,
}: {
  onEditClick: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit topic</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
