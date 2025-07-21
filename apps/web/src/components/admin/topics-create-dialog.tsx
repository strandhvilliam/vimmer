import { useForm } from "@tanstack/react-form";
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
import { cn } from "@vimmer/ui/lib/utils";
import { DateTimePicker } from "@vimmer/ui/components/date-time-picker";
import { useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@vimmer/ui/components/radio-group";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

interface CreateTopicDialogProps {
  marathonId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopicsCreateDialog({
  marathonId,
  isOpen,
  onOpenChange,
}: CreateTopicDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: createTopic, isPending: isCreatingTopic } = useMutation(
    trpc.topics.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      name: "",
      visibility: true,
      scheduledStart: null as Date | null,
      positionType: "end" as "beginning" | "end" | "custom",
      customPosition: 1,
    },
    onSubmit: async ({ value }) => {
      let visibility = "private";
      if (value.visibility) visibility = "public";
      if (value.scheduledStart) visibility = "scheduled";

      let orderIndex = -1;

      if (value.positionType === "beginning") {
        orderIndex = 0;
      } else if (value.positionType === "custom" && value.customPosition) {
        orderIndex = Math.max(0, value.customPosition - 1);
      }
      createTopic({
        data: {
          marathonId,
          name: value.name,
          visibility: visibility as "public" | "private" | "scheduled",
          scheduledStart: value.scheduledStart
            ? value.scheduledStart.toISOString()
            : undefined,
          orderIndex,
        },
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Add a new topic to your marathon. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length < 1) {
                  return "Name is required";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter topic name"
                />
                {field.state.meta.isTouched &&
                field.state.meta.errors.length ? (
                  <p className="text-sm text-destructive mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="positionType"
            children={(field) => (
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Position
                </label>
                <RadioGroup
                  onValueChange={(value) =>
                    field.handleChange(value as "beginning" | "end" | "custom")
                  }
                  value={field.state.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="end" />
                    <label className="text-sm font-normal">At the end</label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="beginning" />
                    <label className="text-sm font-normal">
                      At the beginning
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="custom" />
                    <label className="text-sm font-normal">
                      At specific position
                    </label>
                  </div>
                </RadioGroup>
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.values.positionType]}
            children={([positionType]) =>
              positionType === "custom" ? (
                <form.Field
                  name="customPosition"
                  children={(field) => (
                    <div className="space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Position Number
                      </label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1}
                        value={field.state.value || 1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.handleChange(isNaN(value) ? 1 : value);
                        }}
                        onBlur={field.handleBlur}
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter a position. The topic will be inserted at this
                        position or at the end if the position is greater than
                        the number of topics.
                      </p>
                    </div>
                  )}
                />
              ) : null
            }
          />

          <form.Subscribe
            selector={(state) => [state.values.scheduledStart]}
            children={([scheduledStart]) => (
              <form.Field
                name="visibility"
                children={(field) => (
                  <div
                    className={cn(
                      "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm",
                      scheduledStart && "opacity-50"
                    )}
                  >
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Visibility
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {scheduledStart
                          ? "Visibility will be controlled by schedule"
                          : "Make topic visible to participants"}
                      </p>
                    </div>
                    <Checkbox
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(!!checked)
                      }
                      disabled={!!scheduledStart}
                    />
                  </div>
                )}
              />
            )}
          />

          <form.Field
            name="scheduledStart"
            children={(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Schedule Start
                </label>
                <div className="flex gap-2">
                  <DateTimePicker
                    date={field.state.value || undefined}
                    setDate={(date) => {
                      const newDate = date || null;
                      field.handleChange(newDate);
                    }}
                  />
                  {field.state.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        field.handleChange(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  If set, the topic will only be visible after this date and
                  time. Leave empty for immediate visibility.
                </p>
              </div>
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
            <PrimaryButton type="submit" disabled={isCreatingTopic}>
              {isCreatingTopic ? "Creating..." : "Create Topic"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
