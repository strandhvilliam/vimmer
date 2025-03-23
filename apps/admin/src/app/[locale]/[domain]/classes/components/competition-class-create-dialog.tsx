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
import { z } from "zod";
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
import {
  createCompetitionClassSchema,
  CreateCompetitionClassInput,
} from "@/lib/schemas";
import { createCompetitionClassAction } from "../actions/competition-class-create-action";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Card } from "@vimmer/ui/components/card";
export function CompetitionClassCreateDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { execute: createCompetitionClass, isExecuting: isCreatingClass } =
    useAction(createCompetitionClassAction, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });

  const form = useForm<CreateCompetitionClassInput>({
    resolver: zodResolver(createCompetitionClassSchema),
    defaultValues: {
      name: "",
      description: "",
      numberOfPhotos: 24,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="flex items-center justify-center bg-muted/50">
          <Button
            variant="ghost"
            className="w-full transition duration-200 h-full flex flex-col items-center justify-center py-10 text-muted-foreground"
          >
            <Plus className="h-8 w-8" />
            <span>Add Class</span>
          </Button>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Competition Class</DialogTitle>
          <DialogDescription>
            Create a new competition class. This will be available for
            participants to choose from.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createCompetitionClass)}
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
                          className="text-center !text-2xl  !font-mono"
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
              <PrimaryButton type="submit" disabled={isCreatingClass}>
                {isCreatingClass ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </PrimaryButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
