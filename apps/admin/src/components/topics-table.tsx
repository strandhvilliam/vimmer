"use client";

import { Topic } from "@vimmer/supabase/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@vimmer/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  Images,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Checkbox } from "@vimmer/ui/components/checkbox";
import { Badge } from "@vimmer/ui/components/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ScrollArea, ScrollBar } from "@vimmer/ui/components/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@vimmer/ui/components/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { Calendar as CalendarComponent } from "@vimmer/ui/components/calendar";
import { cn } from "@vimmer/ui/lib/utils";

interface ExtendedTopic extends Topic {
  isPublic?: boolean;
  scheduleStart?: string;
  description?: string;
}

interface TopicsTableProps {
  topics: Topic[];
  onTopicsChange: (topics: Topic[], isOrderChange?: boolean) => void;
}

const EditTopicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  orderIndex: z.number(),
  isPublic: z.boolean(),
  scheduleStart: z.date().optional(),
});

type EditTopicFormValues = z.infer<typeof EditTopicFormSchema>;

export function TopicsTable({ topics, onTopicsChange }: TopicsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<ExtendedTopic | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<ExtendedTopic | null>(null);

  const editForm = useForm<EditTopicFormValues>({
    resolver: zodResolver(EditTopicFormSchema),
  });

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;

    const newTopics = [...topics];
    [newTopics[index - 1], newTopics[index]] = [
      newTopics[index]!,
      newTopics[index - 1]!,
    ];

    const updatedTopics = newTopics.map((topic, idx) => ({
      ...topic,
      orderIndex: idx,
    }));

    onTopicsChange(updatedTopics, true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= topics.length - 1) return;

    const newTopics = [...topics];
    [newTopics[index], newTopics[index + 1]] = [
      newTopics[index + 1]!,
      newTopics[index]!,
    ];

    const updatedTopics = newTopics.map((topic, idx) => ({
      ...topic,
      orderIndex: idx,
    }));

    onTopicsChange(updatedTopics, true);
  };

  const handleDeleteClick = (topic: ExtendedTopic) => {
    setTopicToDelete(topic);
    setDeleteConfirmation("");
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!topicToDelete) return;

    if (deleteConfirmation === topicToDelete.name) {
      const updatedTopics = topics
        .filter((t) => t.id !== topicToDelete.id)
        .map((topic, idx) => ({
          ...topic,
          orderIndex: idx,
        }));

      onTopicsChange(updatedTopics);

      // Reset state
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
      setDeleteConfirmation("");
    }
  };

  const handleEditClick = (topic: ExtendedTopic) => {
    setCurrentTopic({ ...topic });
    editForm.reset({
      name: topic.name,
      orderIndex: topic.orderIndex,
      isPublic: topic.isPublic || false,
      scheduleStart: topic.scheduleStart
        ? new Date(topic.scheduleStart)
        : undefined,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = (data: EditTopicFormValues) => {
    if (!currentTopic) return;

    const updatedTopic: ExtendedTopic = {
      ...currentTopic,
      name: data.name,
      orderIndex: data.orderIndex,
      isPublic: data.isPublic,
      scheduleStart: data.scheduleStart
        ? format(data.scheduleStart, "yyyy-MM-dd'T'HH:mm")
        : undefined,
    };

    const updatedTopics = topics.map((t) =>
      t.id === updatedTopic.id ? updatedTopic : t
    );

    onTopicsChange(updatedTopics);
    setEditModalOpen(false);
  };

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      editForm.setValue("scheduleStart", date);
    }
  }

  function handleTimeChange(type: "hour" | "minute", value: string) {
    const currentDate = editForm.getValues("scheduleStart") || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }

    editForm.setValue("scheduleStart", newDate);
  }

  const columns: ColumnDef<ExtendedTopic>[] = [
    {
      id: "reorderAndIndex",
      header: "Order",
      cell: ({ row }) => {
        const index = row.index;
        return (
          <div className="flex items-center gap-6">
            <div className="font-medium text-center w-6">
              {row.original.orderIndex + 1}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={index === topics.length - 1}
                onClick={() => handleMoveDown(index)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            Topic
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const topic = row.original;
        return <div className="font-medium">{topic.name}</div>;
      },
    },
    {
      id: "submissions",
      header: "Submissions",
      cell: ({ row }) => {
        const count = row.original.orderIndex + 1 * 10;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-8 hover:bg-accent group"
                  onClick={() => {
                    console.log("Show submissions for topic", row.original.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Images className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{count}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View submissions for this topic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const topic = row.original;
        const isScheduled = !!topic.scheduleStart;
        const isPublic = topic.isPublic;

        let status = "Private";
        if (isPublic) {
          status = isScheduled ? "Scheduled" : "Public";
        }

        return (
          <Badge variant={status === "Public" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const topic = row.original;
        // For demo purposes, generate a random number of submissions
        const submissionCount = topic.orderIndex + 1 * 10;

        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(topic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit topic</p>
                </TooltipContent>
              </Tooltip>

              <Dialog
                open={deleteDialogOpen && topicToDelete?.id === topic.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setTopicToDelete(null);
                    setDeleteConfirmation("");
                  }
                  setDeleteDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteClick(topic)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Topic: {topicToDelete?.name}
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      <div className="space-y-4">
                        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                          <p className="text-sm font-medium">
                            This is a dangerous action. Deleting this topic
                            will:
                          </p>
                          <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
                            <li>Remove the topic permanently</li>
                            <li>
                              Affect{" "}
                              <span className="font-semibold">
                                {submissionCount} submissions
                              </span>{" "}
                              associated with this topic
                            </li>
                            <li>This action cannot be undone</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmDelete" className="text-sm">
                            To confirm, type the topic name:{" "}
                            <span className="font-semibold">
                              {topicToDelete?.name}
                            </span>
                          </Label>
                          <Input
                            id="confirmDelete"
                            value={deleteConfirmation}
                            onChange={(e) =>
                              setDeleteConfirmation(e.target.value)
                            }
                            placeholder="Type topic name here"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="sm:justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setTopicToDelete(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteConfirm}
                      disabled={deleteConfirmation !== topicToDelete?.name}
                    >
                      Delete Topic
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  const table = useReactTable({
    data: topics,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "reorderAndIndex", desc: false }],
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No topics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>
              Make changes to the topic details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSave)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="orderIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value + 1}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) - 1)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Visibility</FormLabel>
                      <FormDescription>
                        Make topic visible to participants
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="scheduleStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Start</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM/dd/yyyy HH:mm")
                            ) : (
                              <span>Schedule start time (optional)</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="sm:flex">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 24 }, (_, i) => i)
                                  .reverse()
                                  .map((hour) => (
                                    <Button
                                      key={hour}
                                      size="icon"
                                      variant={
                                        field.value &&
                                        field.value.getHours() === hour
                                          ? "default"
                                          : "ghost"
                                      }
                                      className="sm:w-full shrink-0 aspect-square"
                                      onClick={() =>
                                        handleTimeChange(
                                          "hour",
                                          hour.toString()
                                        )
                                      }
                                    >
                                      {hour}
                                    </Button>
                                  ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i * 5
                                ).map((minute) => (
                                  <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      field.value.getMinutes() === minute
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                      handleTimeChange(
                                        "minute",
                                        minute.toString()
                                      )
                                    }
                                  >
                                    {minute.toString().padStart(2, "0")}
                                  </Button>
                                ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      If set, the topic will only be visible after this date and
                      time. Leave empty for immediate visibility.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Extend the Topic type with our new fields
