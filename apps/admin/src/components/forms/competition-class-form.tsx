// @ts-nocheck
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import {
  CompetitionClass,
  competitionClassSchema,
} from "@/lib/types/competition-class";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CompetitionClassFormProps {
  onSubmit: (data: CompetitionClass) => Promise<void>;
  defaultValues?: Partial<CompetitionClass>;
}

export function CompetitionClassForm({
  onSubmit,
  defaultValues,
}: CompetitionClassFormProps) {
  const router = useRouter();
  const form = useForm<CompetitionClass>({
    resolver: zodResolver(competitionClassSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      numberOfPhotos: defaultValues?.numberOfPhotos ?? 1,
      icon: defaultValues?.icon ?? "camera",
    },
  });

  async function handleSubmit(data: CompetitionClass) {
    try {
      await onSubmit(data);
      form.reset();
      toast.success("Competition class created successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create competition class");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter class name" {...field} />
              </FormControl>
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
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Enter number of photos"
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(parseInt(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                {/* <SelectContent>
                  {Object.entries(Icons).map(([key, Icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent> */}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Competition Class
        </Button>
      </form>
    </Form>
  );
}
