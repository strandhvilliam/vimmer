"use client";

import { Topic } from "@vimmer/supabase/types";
import { useState } from "react";
import { TopicsHeader } from "./topics-header";
import { TopicsTable } from "./topics-table";

interface TopicsWrapperProps {
  initialTopics: Topic[];
  marathonId: string;
}

export function TopicsWrapper({
  initialTopics,
  marathonId,
}: TopicsWrapperProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateTopics = (newTopics: Topic[], isOrderChange = false) => {
    setTopics(newTopics);
    if (isOrderChange) {
      setHasOrderChanges(true);
    } else {
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement save logic here
      // await saveTopics(topics);
      setHasChanges(false);
      setHasOrderChanges(false);
    } catch (error) {
      console.error("Failed to save topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopicsHeader
        marathonId={marathonId}
        hasChanges={hasChanges}
        hasOrderChanges={hasOrderChanges}
        isLoading={isLoading}
        onSave={handleSave}
      />
      <div className="flex-1 overflow-hidden">
        <div className="container h-full py-8 overflow-auto">
          <TopicsTable
            topics={topics}
            onTopicsChange={(newTopics, isOrderChange) =>
              updateTopics(newTopics, isOrderChange)
            }
          />
        </div>
      </div>
    </>
  );
}
