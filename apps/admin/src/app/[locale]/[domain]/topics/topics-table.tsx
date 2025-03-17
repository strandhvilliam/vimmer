"use client";

import { Topic } from "@vimmer/supabase/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import { Badge } from "@vimmer/ui/components/badge";
import { TopicsEditDialog } from "./topics-edit-dialog";
import { DeleteTopicDialog } from "./topics-delete-dialog";
import { cn } from "@vimmer/ui/lib/utils";
import { TopicsDragHandle } from "./topics-drag-handle";
import { TopicsSortableRow } from "./topics-sortable-row";
import { EditTopicInput } from "@/lib/actions/topics-edit-action";
import { TopicsSubmissionsCell } from "./topics-submissions-cell";
import { TopicsActionCell } from "./topics-action-cell";

interface TopicsTableProps {
  topics: Topic[];
  onUpdateTopicsOrder: (newOrdering: number[]) => void;
  onUpdateTopic: (topic: EditTopicInput) => void;
  onDeleteTopic: (topicId: number) => void;
  isLoading?: boolean;
}

export function TopicsTable({
  topics,
  onUpdateTopicsOrder,
  onUpdateTopic,
  onDeleteTopic,
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
    onDeleteTopic(topic.id);
    setDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleEditClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditDialogOpen(true);
  };

  const handleEditSave = (updatedTopic: EditTopicInput) => {
    onUpdateTopic(updatedTopic);
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
    const newData = arrayMove(topics, oldIndex, newIndex);
    onUpdateTopicsOrder(newData.map((t) => t.id));
  };

  const dataIds: UniqueIdentifier[] = topics.map((t) => t.id);
  const tableKey = `${dataIds.join("-")}-${topics.map((t) => t.orderIndex).join("-")}`;

  const columns: ColumnDef<Topic>[] = [
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => {
        return <TopicsDragHandle row={row} />;
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
      cell: ({ row }) => <TopicsSubmissionsCell row={row} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const VISIBILITY_LABELS = {
          public: "Public",
          scheduled: "Scheduled",
          private: "Private",
        } as const;
        const visibility = row.original
          .visibility as keyof typeof VISIBILITY_LABELS;

        const label = VISIBILITY_LABELS[visibility];

        return (
          <Badge variant={label === "Public" ? "default" : "secondary"}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TopicsActionCell
          onEditClick={() => handleEditClick(row.original)}
          onDeleteClick={() => handleDeleteClick(row.original)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: topics,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  return (
    <>
      <div className="space-y-4 bg-background">
        <div
          className={cn(
            "rounded-md border relative",
            isLoading && "pointer-events-none"
          )}
        >
          <DndContext
            id={tableKey}
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
                  key={tableKey}
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <TopicsSortableRow
                      key={row.original.id}
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
