import { Topic } from "@vimmer/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
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
import { Form, FormControl } from "@vimmer/ui/components/form";
import { FormField } from "@vimmer/ui/components/form";
import { FormItem } from "@vimmer/ui/components/form";
import { FormLabel } from "@vimmer/ui/components/form";
import { FormDescription } from "@vimmer/ui/components/form";
import { cn } from "@vimmer/ui/lib/utils";
import { DateTimePicker } from "@vimmer/ui/components/date-time-picker";
import { EditTopicInput } from "../_actions/topics-edit-action";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
const EditTopicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  visibility: z.boolean(),
  scheduledStart: z.date().nullable(),
});

type EditTopicFormValues = z.infer<typeof EditTopicFormSchema>;

interface EditTopicDialogProps {
  topic: Topic | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTopic: EditTopicInput) => void;
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
      visibility: topic?.visibility === "public",
      scheduledStart: topic?.scheduledStart
        ? new Date(topic.scheduledStart)
        : null,
    },
  });

  useEffect(() => {
    if (topic) {
      form.reset({
        name: topic.name,
        visibility: topic.visibility === "public",
        scheduledStart: topic.scheduledStart
          ? new Date(topic.scheduledStart)
          : null,
      });
    }
  }, [topic, form]);

  const handleSave = (data: EditTopicFormValues) => {
    if (!topic) return;

    let visibility = "private";
    if (data.visibility) visibility = "public";
    if (data.scheduledStart) visibility = "scheduled";

    const updatedTopic: EditTopicInput = {
      id: topic.id,
      name: data.name,
      visibility: visibility as "public" | "private" | "scheduled",
      scheduledStart: data.scheduledStart
        ? data.scheduledStart.toISOString()
        : null,
    };

    onSave(updatedTopic);
    onOpenChange(false);
  };

  const isScheduled = form.watch("scheduledStart") !== null;

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
              name="visibility"
              render={({ field }) => {
                return (
                  <FormItem
                    className={cn(
                      "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm",
                      isScheduled && "opacity-50"
                    )}
                  >
                    <div className="space-y-0.5">
                      <FormLabel>Visibility</FormLabel>
                      <FormDescription>
                        {isScheduled
                          ? "Visibility will be controlled by schedule"
                          : "Make topic visible to participants"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isScheduled}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="scheduledStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Start</FormLabel>
                  <div className="flex gap-2">
                    <DateTimePicker
                      date={field.value || undefined}
                      setDate={(date) => field.onChange(date)}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => field.onChange(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                size="sm"
              >
                Cancel
              </Button>
              <PrimaryButton type="submit">Save changes</PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
