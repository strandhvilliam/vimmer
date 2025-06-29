import { Row } from "@tanstack/react-table";
import React from "react";
import { Topic, CompetitionClass } from "@vimmer/supabase/types";
import { Badge } from "@vimmer/ui/components/badge";

interface TopicsCompetitionClassesCellProps {
  row: Row<Topic>;
  competitionClasses: CompetitionClass[];
}

export function TopicsCompetitionClassesCell({
  row,
  competitionClasses,
}: TopicsCompetitionClassesCellProps) {
  const topic = row.original;

  // Find competition classes that are relevant to this topic
  // A topic is relevant if its orderIndex is within the range of photos for a competition class
  const relevantClasses = competitionClasses.filter((competitionClass) => {
    const startIndex = competitionClass.topicStartIndex;
    const endIndex = startIndex + competitionClass.numberOfPhotos - 1;
    return topic.orderIndex >= startIndex && topic.orderIndex <= endIndex;
  });

  if (relevantClasses.length === 0) {
    return <div className="text-sm text-muted-foreground">No classes</div>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {relevantClasses.map((competitionClass) => (
        <Badge
          key={competitionClass.id}
          variant="secondary"
          className="text-xs"
        >
          {competitionClass.name}
        </Badge>
      ))}
    </div>
  );
}
