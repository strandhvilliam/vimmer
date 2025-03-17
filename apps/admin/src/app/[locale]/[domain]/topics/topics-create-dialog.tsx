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
import { Input } from "@vimmer/ui/components/input";
import { Checkbox } from "@vimmer/ui/components/checkbox";
import { Form, FormControl } from "@vimmer/ui/components/form";
import { FormField } from "@vimmer/ui/components/form";
import { FormItem } from "@vimmer/ui/components/form";
import { FormLabel } from "@vimmer/ui/components/form";
import { FormDescription } from "@vimmer/ui/components/form";
import { cn } from "@vimmer/ui/lib/utils";
import { DateTimePicker } from "@vimmer/ui/components/date-time-picker";
import { CreateTopicInput } from "@/lib/actions/topics-create-action";
import { Topic } from "@vimmer/supabase/types";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@vimmer/ui/components/radio-group";

const CreateTopicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  visibility: z.boolean(),
  scheduledStart: z.date().nullable(),
  positionType: z.enum(["beginning", "end", "custom"]),
  customPosition: z.number().min(1).optional(),
});

type CreateTopicFormValues = z.infer<typeof CreateTopicFormSchema>;

interface CreateTopicDialogProps {
  marathonId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newTopic: CreateTopicInput) => void;
}

export function TopicsCreateDialog({
  marathonId,
  isOpen,
  onOpenChange,
  onSave,
}: CreateTopicDialogProps) {
  const form = useForm<CreateTopicFormValues>({
    resolver: zodResolver(CreateTopicFormSchema),
    defaultValues: {
      name: "",
      visibility: true,
      scheduledStart: null,
      positionType: "end",
      customPosition: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        visibility: true,
        scheduledStart: null,
        positionType: "end",
        customPosition: 1,
      });
    }
  }, [isOpen, form]);

  const positionType = form.watch("positionType");
  const isCustomPosition = positionType === "custom";

  const handleSave = (data: CreateTopicFormValues) => {
    let visibility = "private";
    if (data.visibility) visibility = "public";
    if (data.scheduledStart) visibility = "scheduled";

    let orderIndex = -1;

    if (data.positionType === "beginning") {
      orderIndex = 0;
    } else if (data.positionType === "custom" && data.customPosition) {
      orderIndex = Math.max(0, data.customPosition - 1);
    }

    const newTopic: CreateTopicInput = {
      marathonId,
      name: data.name,
      visibility: visibility as "public" | "private" | "scheduled",
      scheduledStart: data.scheduledStart
        ? data.scheduledStart.toISOString()
        : null,
      orderIndex,
    };

    onSave(newTopic);
    form.reset();
    onOpenChange(false);
  };

  const isScheduled = form.watch("scheduledStart") !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Add a new topic to your marathon. Fill in the details below.
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
                    <Input {...field} placeholder="Enter topic name" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="end" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          At the end
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="beginning" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          At the beginning
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="custom" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          At specific position
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            {isCustomPosition && (
              <FormField
                control={form.control}
                name="customPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }}
                        value={field.value || 1}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a position. The topic will be inserted at this
                      position or at the end if the position is greater than the
                      number of topics.
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}
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
              >
                Cancel
              </Button>
              <Button type="submit">Create Topic</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
