// @ts-nocheck
"use client";

import { Button } from "@vimmer/ui/components/button";
import { Plus, Minus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { useState } from "react";
import { Form } from "@vimmer/ui/components/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@vimmer/ui/components/input";
import NumberFlow from "@number-flow/react";
import { useAction } from "next-safe-action/hooks";
import { editCompetitionClassAction } from "../_actions/competition-class-edit-action";
import {
  EditCompetitionClassInput,
  editCompetitionClassSchema,
} from "@/lib/schemas";
import { toast } from "sonner";
import { CompetitionClass } from "@vimmer/supabase/types";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface CompetitionClassEditDialogProps {
  classItem: CompetitionClass;
  trigger?: React.ReactNode;
}

export function CompetitionClassEditDialog({
  classItem,
  trigger,
}: CompetitionClassEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { execute: editCompetitionClass, isExecuting: isEditingClass } =
    useAction(editCompetitionClassAction, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success("Competition class updated successfully");
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Something went wrong");
      },
    });

  const form = useForm<EditCompetitionClassInput>({
    resolver: zodResolver(editCompetitionClassSchema),
    defaultValues: {
      id: classItem.id,
      name: classItem.name || "",
      description: classItem.description || "",
      numberOfPhotos: classItem.numberOfPhotos,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Competition Class</DialogTitle>
          <DialogDescription>
            Modify the competition class details. These changes will be
            reflected immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(editCompetitionClass)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Marathon" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the competition class.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full day challenge with photos"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the competition class.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfPhotos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Photos</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => {
                          const newValue = Math.max(1, Number(field.value) - 1);
                          field.onChange(newValue);
                        }}
                      >
                        <Minus className="h-6 w-6" />
                      </Button>
                      <div className="flex justify-center items-center gap-3 px-4">
                        <NumberFlow
                          value={field.value}
                          onChange={field.onChange}
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
                            Number(field.value) + 1
                          );
                          field.onChange(newValue);
                        }}
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    How many photos participants need to take.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <PrimaryButton
                type="submit"
                disabled={isEditingClass}
                className="min-w-24"
              >
                {isEditingClass ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </PrimaryButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
