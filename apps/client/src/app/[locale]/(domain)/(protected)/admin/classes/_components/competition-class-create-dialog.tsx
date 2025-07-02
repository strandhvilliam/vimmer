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
import { useForm } from "@tanstack/react-form";
import { Input } from "@vimmer/ui/components/input";
import NumberFlow from "@number-flow/react";
import { createCompetitionClassSchema } from "@/lib/schemas";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useDomain } from "@/contexts/domain-context";
import { useSuspenseQuery } from "@tanstack/react-query";

export function CompetitionClassCreateDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain })
  );

  const { mutate: createCompetitionClass, isPending: isCreatingClass } =
    useMutation(
      trpc.competitionClasses.create.mutationOptions({
        onSuccess: () => {
          toast.success("Competition class created successfully");
          onOpenChange(false);
          form.reset();
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
      name: "",
      description: "",
      numberOfPhotos: 24,
    },
    onSubmit: async ({ value }) => {
      if (!marathon?.id) {
        toast.error("Marathon not found");
        return;
      }

      createCompetitionClass({
        data: {
          name: value.name,
          description: value.description,
          numberOfPhotos: value.numberOfPhotos,
          marathonId: marathon.id,
          topicStartIndex: 0,
        },
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Competition Class</DialogTitle>
          <DialogDescription>
            Create a new competition class. This will be available for
            participants to choose from.
          </DialogDescription>
        </DialogHeader>
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
                  createCompetitionClassSchema.shape.name.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
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
                  createCompetitionClassSchema.shape.description.safeParse(
                    value
                  );
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
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
                  createCompetitionClassSchema.shape.numberOfPhotos.safeParse(
                    value
                  );
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
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
                      const newValue = Math.max(
                        1,
                        Number(field.state.value) - 1
                      );
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
                      const newValue = Math.min(
                        50,
                        Number(field.state.value) + 1
                      );
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

          <div className="flex justify-end gap-3">
            <PrimaryButton type="submit" disabled={isCreatingClass}>
              {isCreatingClass ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
