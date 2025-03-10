"use client";

import { Topic } from "@vimmer/supabase/types";
import { useState, useEffect } from "react";
import { TopicsHeader } from "./topics-header";
import { TopicsTable } from "./topics-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the form schema
const topicsFormSchema = z.object({
  topics: z.array(z.custom<Topic>()),
  hasOrderChanges: z.boolean().default(false),
});

type TopicsFormValues = z.infer<typeof topicsFormSchema>;

interface TopicsWrapperProps {
  initialTopics: Topic[];
  marathonId: string;
}

export function TopicsWrapper({
  initialTopics,
  marathonId,
}: TopicsWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<TopicsFormValues>({
    resolver: zodResolver(topicsFormSchema),
    defaultValues: {
      topics: initialTopics,
      hasOrderChanges: false,
    },
  });

  // Watch for changes in the form values
  const { topics, hasOrderChanges } = form.watch();

  const updateOrdering = (newTopics: Topic[]) => {
    form.setValue("topics", newTopics, { shouldDirty: true });
    form.setValue("hasOrderChanges", true);
  };

  const onSubmit = async (data: TopicsFormValues) => {
    try {
      setIsLoading(true);
      // TODO: Implement save logic here
      // await saveTopics(data.topics);

      // Reset the form state after successful save
      form.setValue("hasOrderChanges", false);
      form.reset(
        { topics: data.topics, hasOrderChanges: false },
        { keepValues: true }
      );
    } catch (error) {
      console.error("Failed to save topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a handler that triggers form submission
  const handleSave = form.handleSubmit(onSubmit);

  return (
    <div className="flex flex-1 flex-col">
      <TopicsHeader
        marathonId={marathonId}
        hasOrderChanges={hasOrderChanges}
        isLoading={isLoading}
        onSave={handleSave}
      />
      <div className="flex-1">
        <div className="container h-full py-8">
          <TopicsTable topics={topics} onTopicsChange={updateOrdering} />
        </div>
      </div>
    </div>
  );
}
