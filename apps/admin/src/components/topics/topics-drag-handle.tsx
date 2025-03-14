import { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { UniqueIdentifier } from "@dnd-kit/core";
import NumberFlow from "@number-flow/react";

interface DragHandleProps {
  id: number;
  index: number;
  dataIds: UniqueIdentifier[];
}

export function TopicsDragHandle({ id, index, dataIds }: DragHandleProps) {
  const { attributes, listeners } = useSortable({
    id,
  });
  const [localIndex, setLocalIndex] = useState((index + 1) * 2);

  useEffect(() => {
    setLocalIndex(index + 1);
  }, []);

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
