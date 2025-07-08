"use client";

import { Button } from "@vimmer/ui/components/button";
import { Plus, Minus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Suspense } from "react";
import { Input } from "@vimmer/ui/components/input";
import NumberFlow from "@number-flow/react";
import { editCompetitionClassSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useDomain } from "@/contexts/domain-context";

interface CompetitionClassEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competitionClassId: number | null;
}

function CompetitionClassEditForm({
  competitionClassId,
  onSuccess,
}: {
  competitionClassId: number;
  onSuccess: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();

  const { data: competitionClass } = useSuspenseQuery(
    trpc.competitionClasses.getById.queryOptions({ id: competitionClassId })
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({ domain })
  );

  const { mutate: editCompetitionClass, isPending } = useMutation(
    trpc.competitionClasses.update.mutationOptions({
      onSuccess: () => {
        onSuccess();
        toast.success("Competition class updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.competitionClasses.pathKey(),
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      id: competitionClass?.id,
      name: competitionClass?.name || "",
      description: competitionClass?.description || "",
      numberOfPhotos: competitionClass?.numberOfPhotos || 0,
      topicStartIndex: competitionClass?.topicStartIndex || 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.id) {
        return;
      }

      editCompetitionClass({
        id: value.id,
        data: {
          name: value.name,
          description: value.description,
          numberOfPhotos: value.numberOfPhotos,
          topicStartIndex: value.topicStartIndex,
        },
      });
    },
  });

  if (!competitionClass) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">
          Competition class not found
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const result =
              editCompetitionClassSchema.shape.name.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
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
              placeholder="Marathon"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              The name of the competition class.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{
          onChange: ({ value }) => {
            const result =
              editCompetitionClassSchema.shape.description.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Full day challenge with photos"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              A brief description of the competition class.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="numberOfPhotos"
        validators={{
          onChange: ({ value }) => {
            const result =
              editCompetitionClassSchema.shape.numberOfPhotos.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Number of Photos
            </label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  const newValue = Math.max(1, Number(field.state.value) - 1);
                  field.handleChange(newValue);
                }}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="flex justify-center items-center gap-3 px-4">
                <NumberFlow
                  value={field.state.value}
                  className="text-center !text-2xl !font-mono"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  const newValue = Math.min(50, Number(field.state.value) + 1);
                  field.handleChange(newValue);
                }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              How many photos participants need to take.
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="topicStartIndex"
        validators={{
          onChange: ({ value }) => {
            const result =
              editCompetitionClassSchema.shape.topicStartIndex.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Starting Topic
            </label>
            <Select
              value={field.state.value.toString()}
              onValueChange={(value) => field.handleChange(parseInt(value))}
              disabled={topics.length === 0}
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    topics.length === 0
                      ? "No topics available"
                      : "Select starting topic"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {topics
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((topic, index) => (
                    <SelectItem key={topic.id} value={index.toString()}>
                      {index + 1}. {topic.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {topics.length === 0
                ? "Create topics first to set a starting topic for this class."
                : "The topic number where this class will start from."}
            </p>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onSuccess}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(formState) => [
            formState.canSubmit,
            formState.isSubmitting,
          ]}
        >
          {([canSubmit, isSubmitting]) => (
            <PrimaryButton
              type="submit"
              disabled={!canSubmit || isPending}
              className="min-w-24"
            >
              {isSubmitting || isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </PrimaryButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function CompetitionClassEditDialog({
  isOpen,
  onOpenChange,
  competitionClassId,
}: CompetitionClassEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Competition Class</DialogTitle>
          <DialogDescription>
            Modify the competition class details. These changes will be
            reflected immediately.
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        >
          {competitionClassId && (
            <CompetitionClassEditForm
              competitionClassId={competitionClassId}
              onSuccess={() => onOpenChange(false)}
            />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
