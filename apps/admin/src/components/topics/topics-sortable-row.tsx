import { useSortable } from "@dnd-kit/sortable";
import { Row } from "@tanstack/react-table";
import { Topic } from "@vimmer/supabase/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@vimmer/ui/lib/utils";
import { flexRender } from "@tanstack/react-table";
import { TableCell, TableRow } from "@vimmer/ui/components/table";
import { CSS } from "@dnd-kit/utilities";

interface TopicsSortableRowProps {
  row: Row<Topic>;
  index: number;
  dataIds: UniqueIdentifier[];
}

export function TopicsSortableRow({ row }: TopicsSortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn("bg-background cursor-default", isDragging && "opacity-50")}
      {...attributes}
      data-order-index={row.original.orderIndex}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
