import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import { Button } from "@vimmer/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@vimmer/ui/components/dialog"
import { useEffect } from "react"
import { Input } from "@vimmer/ui/components/input"
import { Checkbox } from "@vimmer/ui/components/checkbox"
import { cn } from "@vimmer/ui/lib/utils"
import { DateTimePicker } from "@vimmer/ui/components/date-time-picker"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { Topic } from "@vimmer/api/db/types"

interface EditTopicDialogProps {
  topic: Topic | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TopicsEditDialog({
  topic,
  isOpen,
  onOpenChange,
}: EditTopicDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: updateTopic, isPending: isUpdatingTopic } = useMutation(
    trpc.topics.update.mutationOptions({
      onError: (error) => {
        toast.error("Failed to update topic", {
          description: error.message,
        })
      },
      onSuccess: () => {
        toast.success("Topic updated")
        onOpenChange(false)
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.topics.pathKey(),
        })
      },
    })
  )

  const form = useForm({
    defaultValues: {
      name: topic?.name || "",
      visibility: topic?.visibility === "public",
      scheduledStart: topic?.scheduledStart
        ? new Date(topic.scheduledStart)
        : (null as Date | null),
    },
    onSubmit: async ({ value }) => {
      if (!topic) return

      let visibility = "private"
      if (value.visibility) visibility = "public"
      // if (value.scheduledStart) visibility = "scheduled"

      updateTopic({
        id: topic.id,
        data: {
          name: value.name,
          visibility: visibility as "public" | "private" | "scheduled",
          // scheduledStart: value.scheduledStart
          //   ? value.scheduledStart.toISOString()
          //   : undefined,
        },
      })
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (topic) {
      const newScheduledStart = topic.scheduledStart
        ? new Date(topic.scheduledStart)
        : null

      form.setFieldValue("name", topic.name)
      form.setFieldValue("visibility", topic.visibility === "public")
      form.setFieldValue("scheduledStart", newScheduledStart)
    }
  }, [topic, form])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogDescription>
            Make changes to the topic details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length < 1) {
                  return "Name is required"
                }
                return undefined
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
                />
                <>
                  {field.state.meta.isTouched &&
                  field.state.meta.errors.length ? (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  ) : null}
                </>
              </div>
            )}
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
                <label className="text-sm text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Schedule Start (Coming soon...)
                </label>
                <div className="flex gap-2">
                  <DateTimePicker
                    disabled={true}
                    date={field.state.value || undefined}
                    setDate={(date) => {
                      const newDate = date || null
                      field.handleChange(newDate)
                    }}
                  />
                  {field.state.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        field.handleChange(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  If set, the topic will only be visible after this date and
                  time. Leave empty for immediate visibility. (Coming soon...)
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
            <PrimaryButton type="submit" disabled={isUpdatingTopic}>
              {isUpdatingTopic ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
