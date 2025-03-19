"use client";

import { Button } from "@vimmer/ui/components/button";
import { Plus, Minus } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  numberOfPhotos: z.coerce
    .number()
    .min(1, {
      message: "Must have at least 1 photo.",
    })
    .max(50, {
      message: "Cannot exceed 50 photos.",
    }),
});

type FormData = z.infer<typeof formSchema>;

export function CompetitionClassCreateDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: {
    name: string;
    description: string;
    numberOfPhotos: number;
  }) => {
    // onAddClass(data);
    setIsOpen(false);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      numberOfPhotos: 24,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Class
        </Button>
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
            onSubmit={form.handleSubmit(handleSubmit)}
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
                      {/* <Input
                        type="number"
                        min={1}
                        max={50}
                        className="text-center !text-6xl h-20 !font-mono"
                        {...field}
                      /> */}
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
              <Button type="submit">Add Class</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
