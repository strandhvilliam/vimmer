import { Topic } from "@vimmer/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@vimmer/ui/components/dialog";
import { useEffect } from "react";
import { Input } from "@vimmer/ui/components/input";
import { Checkbox } from "@vimmer/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@vimmer/ui/components/popover";
import { Form, FormControl } from "@vimmer/ui/components/form";
import { FormField } from "@vimmer/ui/components/form";
import { FormItem } from "@vimmer/ui/components/form";
import { FormLabel } from "@vimmer/ui/components/form";
import { FormDescription } from "@vimmer/ui/components/form";
import { ScrollArea, ScrollBar } from "@vimmer/ui/components/scroll-area";
import { Calendar as CalendarComponent } from "@vimmer/ui/components/calendar";
import { cn } from "@vimmer/ui/lib/utils";

const EditTopicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  orderIndex: z.number(),
  visibility: z.enum(["public", "private"]),
  scheduledStart: z.date().optional(),
});

type EditTopicFormValues = z.infer<typeof EditTopicFormSchema>;

interface EditTopicDialogProps {
  topic: Topic | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTopic: Topic) => void;
}
export function TopicsEditDialog({
  topic,
  isOpen,
  onOpenChange,
  onSave,
}: EditTopicDialogProps) {
  const form = useForm<EditTopicFormValues>({
    resolver: zodResolver(EditTopicFormSchema),
    defaultValues: {
      name: topic?.name || "",
      orderIndex: topic?.orderIndex || 0,
      visibility: (topic?.visibility || "private") as "public" | "private",
      scheduledStart: topic?.scheduledStart
        ? new Date(topic.scheduledStart)
        : undefined,
    },
  });

  // Reset form when topic changes
  useEffect(() => {
    if (topic) {
      form.reset({
        name: topic.name,
        orderIndex: topic.orderIndex,
        visibility: topic.visibility as "public" | "private",
        scheduledStart: topic.scheduledStart
          ? new Date(topic.scheduledStart)
          : undefined,
      });
    }
  }, [topic, form]);

  const handleSave = (data: EditTopicFormValues) => {
    if (!topic) return;

    const updatedTopic: Topic = {
      ...topic,
      name: data.name,
      orderIndex: data.orderIndex,
      visibility: data.visibility,
      scheduledStart: data.scheduledStart
        ? format(data.scheduledStart, "yyyy-MM-dd'T'HH:mm")
        : null,
    };

    onSave(updatedTopic);
    onOpenChange(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("scheduledStart", date);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const currentDate = form.getValues("scheduledStart") || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      newDate.setHours(parseInt(value, 10));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }

    form.setValue("scheduledStart", newDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>
            Make changes to the topic details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="visibility"
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
                      checked={field.value === "public"}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledStart"
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
                                      handleTimeChange("hour", hour.toString())
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
                              {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                (minute) => (
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
                                )
                              )}
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
                onClick={() => onOpenChange(false)}
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
  );
}
