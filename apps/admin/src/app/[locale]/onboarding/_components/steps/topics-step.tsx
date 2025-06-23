"use client";

import { useState } from "react";
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
import { useOnboarding } from "../onboarding-context";
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
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function SortableTopicItem({
  topic,
  onEdit,
  onDelete,
}: SortableTopicItemProps) {
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
  const { data, updateTopics } = useOnboarding();
  const [topics, setTopics] = useState<Topic[]>(data.topics || []);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [topicForm, setTopicForm] = useState<TopicFormData>({
    name: "",
    visibility: "public",
  });

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
    if (!topicForm.name.trim()) return;

    const newTopic: Topic = {
      id: Date.now(), // Temporary ID for onboarding
      name: topicForm.name,
      visibility: topicForm.visibility,
      scheduledStart: topicForm.scheduledStart || null,
      orderIndex: topics.length,
      marathonId: 0, // Will be set when saving
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);
    updateTopics(updatedTopics);

    setTopicForm({
      name: "",
      visibility: "public",
    });
    setIsAddingTopic(false);
  };

  const handleEditTopic = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (topic) {
      setTopicForm({
        name: topic.name,
        visibility: topic.visibility,
        scheduledStart: topic.scheduledStart || undefined,
      });
      setEditingTopicId(id);
      setIsAddingTopic(true);
    }
  };

  const handleUpdateTopic = () => {
    if (!topicForm.name.trim() || !editingTopicId) return;

    const updatedTopics = topics.map((topic) =>
      topic.id === editingTopicId
        ? {
            ...topic,
            name: topicForm.name,
            visibility: topicForm.visibility,
            scheduledStart: topicForm.scheduledStart || null,
          }
        : topic
    );

    setTopics(updatedTopics);
    updateTopics(updatedTopics);

    setTopicForm({
      name: "",
      visibility: "public",
    });
    setEditingTopicId(null);
    setIsAddingTopic(false);
  };

  const handleDeleteTopic = (id: number) => {
    const updatedTopics = topics
      .filter((topic) => topic.id !== id)
      .map((topic, index) => ({ ...topic, orderIndex: index }));

    setTopics(updatedTopics);
    updateTopics(updatedTopics);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = topics.findIndex((topic) => topic.id === active.id);
    const newIndex = topics.findIndex((topic) => topic.id === over.id);

    const reorderedTopics = arrayMove(topics, oldIndex, newIndex).map(
      (topic, index) => ({ ...topic, orderIndex: index })
    );

    setTopics(reorderedTopics);
    updateTopics(reorderedTopics);
  };

  const activeTopic = activeId
    ? topics.find((topic) => topic.id === activeId)
    : null;

  const handleContinue = () => {
    updateTopics(topics);
    onNext();
  };

  const handleCancel = () => {
    setTopicForm({
      name: "",
      visibility: "public",
    });
    setEditingTopicId(null);
    setIsAddingTopic(false);
  };

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
          <CardTitle className="flex items-center gap-2">
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
                    onEdit={handleEditTopic}
                    onDelete={handleDeleteTopic}
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
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <PrimaryButton
                    onClick={
                      editingTopicId ? handleUpdateTopic : handleAddTopic
                    }
                    disabled={!topicForm.name.trim()}
                  >
                    {editingTopicId ? "Update Topic" : "Add Topic"}
                  </PrimaryButton>
                  <Button variant="outline" onClick={handleCancel} size="sm">
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
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
        )}
        <div className="ml-auto">
          <PrimaryButton onClick={handleContinue}>
            {isLastStep ? "Complete Setup" : "Continue"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
