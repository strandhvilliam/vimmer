import { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { UniqueIdentifier } from "@dnd-kit/core";
import NumberFlow from "@number-flow/react";
import { Row } from "@tanstack/react-table";
import { Topic } from "@vimmer/supabase/types";

interface DragHandleProps {
  row: Row<Topic>;
}

export function TopicsDragHandle({ row }: DragHandleProps) {
  const { attributes, listeners } = useSortable({
    id: row.original.id,
  });
  const [localIndex, setLocalIndex] = useState(
    (row.original.orderIndex + 1) * 2
  );

  useEffect(() => {
    setLocalIndex(row.original.orderIndex + 1);
  }, [row.original.orderIndex]);

  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="font-medium text-center w-6">
        <NumberFlow value={localIndex} />
      </div>
    </div>
  );
}
