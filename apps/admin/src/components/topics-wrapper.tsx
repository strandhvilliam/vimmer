"use client";

import { Topic } from "@vimmer/supabase/types";
import { useEffect, useRef, useState } from "react";
import { TopicsHeader } from "./topics-header";
import { TopicsTable } from "./topics-table";
import { useSortable } from "@dnd-kit/react/sortable";

interface TopicsWrapperProps {
  initialTopics: Topic[];
  marathonId: string;
}

function Sortable({ id, index }: { id: number; index: number }) {
  const dragRef = useRef(null);

  const { ref } = useSortable({
    id,
    index,
    handle: dragRef,
  });

  return (
    <li ref={ref} className="item">
      Item {id}
      <button ref={dragRef}>🟰</button>
    </li>
  );
}

export function TopicsWrapper({
  initialTopics,
  marathonId,
}: TopicsWrapperProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicsChange = async (newTopics: Topic[]) => {
    setTopics(newTopics);

    try {
      setIsLoading(true);
      // TODO: Implement save logic here
      // await saveTopics(newTopics);
    } catch (error) {
      console.error("Failed to save topics:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const items = [1, 2, 3, 4];

  return (
    <div className="flex flex-1 flex-col">
      <TopicsHeader marathonId={marathonId} />
      <div className="flex-1">
        <div className="container h-full py-8">
          <TopicsTable
            topics={topics}
            onTopicsChange={handleTopicsChange}
            isLoading={isLoading}
          />
          {/* <ul className="list">
            {items.map((id, index) => (
              <Sortable key={id} id={id} index={index} />
            ))}
          </ul> */}
        </div>
      </div>
    </div>
  );
}
