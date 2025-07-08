"use client";

import { useEffect, useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Badge } from "@vimmer/ui/components/badge";
import { Plus, Trash2, GripVertical, MoreHorizontal, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";
import { Topic } from "@vimmer/supabase/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { createPortal } from "react-dom";

interface TopicsStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

interface TopicFormData {
  name: string;
  visibility: string;
  scheduledStart?: string;
}

interface SortableTopicItemProps {
  topic: Topic;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: TopicFormData) => void;
  isLoading: boolean;
}

interface EditTopicPopoverProps {
  topic: Topic;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: number, data: TopicFormData) => void;
  isLoading: boolean;
}

function EditTopicPopover({
  topic,
  isOpen,
  onOpenChange,
  onUpdate,
  isLoading,
}: EditTopicPopoverProps) {
  const [topicForm, setTopicForm] = useState<TopicFormData>({
    name: topic.name,
    visibility: topic.visibility,
    scheduledStart: topic.scheduledStart || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.name.trim()) return;

    onUpdate(topic.id, topicForm);
  };

  const handleCancel = () => {
    setTopicForm({
      name: topic.name,
      visibility: topic.visibility,
      scheduledStart: topic.scheduledStart || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start h-8 px-2 text-sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Topic
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit Topic</h4>
            <p className="text-sm text-muted-foreground">
              Update the topic details below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic-name">Topic Name</Label>
              <Input
                id="edit-topic-name"
                value={topicForm.name}
                onChange={(e) =>
                  setTopicForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Nature Photography"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-visibility">Visibility</Label>
              <Select
                value={topicForm.visibility}
                onValueChange={(value) =>
                  setTopicForm((prev) => ({
                    ...prev,
                    visibility: value as "public" | "private" | "scheduled",
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {topicForm.visibility === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="edit-scheduled-start">Scheduled Start</Label>
                <Input
                  id="edit-scheduled-start"
                  type="datetime-local"
                  value={topicForm.scheduledStart || ""}
                  onChange={(e) =>
                    setTopicForm((prev) => ({
                      ...prev,
                      scheduledStart: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <PrimaryButton
              type="submit"
              disabled={!topicForm.name.trim() || isLoading}
            >
              {isLoading ? "Updating..." : "Update Topic"}
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function SortableTopicItem({
  topic,
  onDelete,
  onUpdate,
  isLoading,
}: SortableTopicItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = (id: number, data: TopicFormData) => {
    onUpdate(id, data);
    setIsEditOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg bg-background",
        isDragging && "opacity-50 z-0"
      )}
      {...attributes}
    >
      <div
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {topic.orderIndex + 1}.
          </span>
          <span className="text-sm font-medium truncate">{topic.name}</span>
          <Badge
            variant={
              topic.visibility === "public"
                ? "default"
                : topic.visibility === "scheduled"
                  ? "secondary"
                  : "outline"
            }
            className="text-xs"
          >
            {topic.visibility}
          </Badge>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <EditTopicPopover
              topic={topic}
              isOpen={isEditOpen}
              onOpenChange={setIsEditOpen}
              onUpdate={handleUpdate}
              isLoading={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(topic.id)}
              className="justify-start h-8 px-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Topic
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Static topic item component for the drag overlay
function TopicItem({
  topic,
  onEdit,
  onDelete,
  isDragging = false,
  className,
}: {
  topic: Topic;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isDragging?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg bg-background",
        isDragging && "shadow-xl border-primary/50 ",
        className
      )}
    >
      <div className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {topic.orderIndex + 1}.
          </span>
          <span className="text-sm font-medium truncate">{topic.name}</span>
          <Badge
            variant={
              topic.visibility === "public"
                ? "default"
                : topic.visibility === "scheduled"
                  ? "secondary"
                  : "outline"
            }
            className="text-xs"
          >
            {topic.visibility}
          </Badge>
        </div>
      </div>

      {onEdit && onDelete && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(topic.id)}
                className="justify-start h-8 px-2 text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Topic
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(topic.id)}
                className="justify-start h-8 px-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Topic
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function TopicsStep({
  onNext,
  onPrev,
  canGoBack,
  isLastStep,
}: TopicsStepProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();

  // Fetch marathon and topics data
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain })
  );

  const { data: topicsData } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({ domain })
  );

  const [topics, setTopics] = useState<Topic[]>(topicsData || []);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [topicForm, setTopicForm] = useState<TopicFormData>({
    name: "",
    visibility: "public",
  });

  useEffect(() => {
    setTopics(topicsData || []);
  }, [topicsData]);

  const { mutate: createTopic, isPending: isCreating } = useMutation(
    trpc.topics.create.mutationOptions({
      onSuccess: () => {
        toast.success("Topic added successfully");
        setTopicForm({
          name: "",
          visibility: "public",
        });
        setIsAddingTopic(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add topic");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const { mutate: updateTopic, isPending: isUpdating } = useMutation(
    trpc.topics.update.mutationOptions({
      onSuccess: () => {
        toast.success("Topic updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update topic");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const { mutate: deleteTopic, isPending: isDeleting } = useMutation(
    trpc.topics.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Topic deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete topic");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const { mutate: updateTopicsOrder, isPending: isReordering } = useMutation(
    trpc.topics.updateOrder.mutationOptions({
      onSuccess: () => {
        toast.success("Topics reordered successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reorder topics");
        // Revert the local state on error
        setTopics(topicsData || []);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTopic = () => {
    if (!topicForm.name.trim() || !marathon?.id) return;

    createTopic({
      data: {
        name: topicForm.name,
        visibility: topicForm.visibility,
        scheduledStart: topicForm.scheduledStart || undefined,
        orderIndex: topics.length,
        marathonId: marathon.id,
      },
    });
  };

  const handleUpdateTopic = (id: number, data: TopicFormData) => {
    updateTopic({
      id,
      data: {
        name: data.name,
        visibility: data.visibility,
        scheduledStart: data.scheduledStart || undefined,
      },
    });
  };

  const handleDeleteTopic = (id: number) => {
    if (!marathon?.id) return;

    deleteTopic({
      id,
      marathonId: marathon.id,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id || !marathon?.id) return;

    const oldIndex = topics.findIndex((topic) => topic.id === active.id);
    const newIndex = topics.findIndex((topic) => topic.id === over.id);

    const reorderedTopics = arrayMove(topics, oldIndex, newIndex).map(
      (topic, index) => ({ ...topic, orderIndex: index })
    );

    // Update local state optimistically
    setTopics(reorderedTopics);

    // Send the update to the server
    const topicIds = reorderedTopics.map((topic) => topic.id);
    updateTopicsOrder({
      topicIds,
      marathonId: marathon.id,
    });
  };

  const activeTopic = activeId
    ? topics.find((topic) => topic.id === activeId)
    : null;

  const handleContinue = () => {
    onNext();
  };

  const handleCancel = () => {
    setTopicForm({
      name: "",
      visibility: "public",
    });
    setIsAddingTopic(false);
  };

  const isLoading = isCreating || isUpdating || isDeleting || isReordering;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-rocgrotesk">
          Marathon Topics
        </h1>
        <p className="text-muted-foreground">
          Create and organize the topics for your photo marathon. Topics define
          the themes participants will photograph.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-rocgrotesk">
            <span>Topics</span>
            <Badge variant="secondary">{topics.length}</Badge>
          </CardTitle>
          <CardDescription>
            Add topics that participants will photograph. You can reorder them
            by dragging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Topic List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={topics.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {topics.map((topic) => (
                  <SortableTopicItem
                    key={topic.id}
                    topic={topic}
                    onUpdate={handleUpdateTopic}
                    onDelete={handleDeleteTopic}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </SortableContext>

            {typeof window !== "undefined" &&
              createPortal(
                <DragOverlay
                  dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: {
                        active: {
                          opacity: "0.4",
                        },
                      },
                    }),
                  }}
                >
                  {activeTopic ? (
                    <TopicItem
                      topic={activeTopic}
                      isDragging
                      className=" shadow-2xl border-primary/50"
                    />
                  ) : null}
                </DragOverlay>,
                document.body
              )}
          </DndContext>

          {topics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No topics added yet. Add your first topic to get started.</p>
            </div>
          )}

          {/* Add/Edit Topic Form */}
          {isAddingTopic && (
            <div className="border rounded-lg p-4 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topicName">Topic Name</Label>
                    <Input
                      id="topicName"
                      value={topicForm.name}
                      onChange={(e) =>
                        setTopicForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nature Photography"
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={topicForm.visibility}
                      onValueChange={(value) =>
                        setTopicForm((prev) => ({
                          ...prev,
                          visibility: value as
                            | "public"
                            | "private"
                            | "scheduled",
                        }))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {topicForm.visibility === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledStart">Scheduled Start</Label>
                    <Input
                      id="scheduledStart"
                      type="datetime-local"
                      value={topicForm.scheduledStart || ""}
                      onChange={(e) =>
                        setTopicForm((prev) => ({
                          ...prev,
                          scheduledStart: e.target.value,
                        }))
                      }
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <PrimaryButton
                    onClick={handleAddTopic}
                    disabled={!topicForm.name.trim() || isLoading}
                  >
                    {isLoading ? "Processing..." : "Add Topic"}
                  </PrimaryButton>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Topic Button */}
          {!isAddingTopic && (
            <Button
              variant="outline"
              onClick={() => setIsAddingTopic(true)}
              className="w-full"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        {canGoBack && (
          <Button variant="outline" onClick={onPrev} disabled={isLoading}>
            Previous
          </Button>
        )}
        <div className="ml-auto">
          <PrimaryButton onClick={handleContinue} disabled={isLoading}>
            {isLastStep ? "Complete Setup" : "Continue"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
