"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Trophy, Plus, X, Camera } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

const competitionClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  numberOfPhotos: z
    .number()
    .min(1, "Must require at least 1 photo")
    .max(100, "Cannot exceed 100 photos"),
  topicStartIndex: z.number().min(0, "Start index cannot be negative"),
});

type CompetitionClassForm = z.infer<typeof competitionClassSchema>;

interface CompetitionClassStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

type LocalCompetitionClass = {
  id: number | string; // Use string for temporary IDs
  name: string;
  description?: string;
  numberOfPhotos: number;
  topicStartIndex: number;
  isNew?: boolean; // Flag to identify new classes
};

export function CompetitionClassStep({
  onNext,
  onPrev,
  canGoBack,
}: CompetitionClassStepProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [localClasses, setLocalClasses] = useState<LocalCompetitionClass[]>([]);
  const [deletedClassIds, setDeletedClassIds] = useState<number[]>([]);

  // Fetch marathon and competition classes data
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain })
  );

  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({ domain })
  );

  // Initialize local state with existing classes
  useEffect(() => {
    if (competitionClasses) {
      setLocalClasses(
        competitionClasses.map((cc) => ({
          id: cc.id,
          name: cc.name,
          description: cc.description || undefined,
          numberOfPhotos: cc.numberOfPhotos,
          topicStartIndex: cc.topicStartIndex,
          isNew: false,
        }))
      );
    }
  }, [competitionClasses]);

  // Create competition class mutation
  const { mutate: createCompetitionClass } = useMutation(
    trpc.competitionClasses.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to add competition class");
      },
    })
  );

  // Delete competition class mutation
  const { mutate: deleteCompetitionClass } = useMutation(
    trpc.competitionClasses.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to remove competition class");
      },
    })
  );

  // Batch mutations for continue action
  const { mutate: batchMutate, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!marathon?.id) {
        throw new Error("Marathon not found");
      }

      // Delete removed classes first
      const deletePromises = deletedClassIds.map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            deleteCompetitionClass(
              { id },
              {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              }
            );
          })
      );

      // Create new classes
      const newClasses = localClasses.filter((cc) => cc.isNew);
      const createPromises = newClasses.map(
        (cc) =>
          new Promise<void>((resolve, reject) => {
            createCompetitionClass(
              {
                data: {
                  name: cc.name,
                  description: cc.description,
                  numberOfPhotos: cc.numberOfPhotos,
                  topicStartIndex: cc.topicStartIndex,
                  marathonId: marathon.id,
                },
              },
              {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
              }
            );
          })
      );

      await Promise.all([...deletePromises, ...createPromises]);
    },
    onSuccess: () => {
      toast.success("Competition classes updated successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.competitionClasses.pathKey(),
      });
      onNext();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update competition classes");
    },
  });

  const form = useForm<CompetitionClassForm>({
    resolver: zodResolver(competitionClassSchema),
    defaultValues: {
      name: "",
      description: "",
      numberOfPhotos: 24,
      topicStartIndex: 0,
    },
  });

  const handleAddClass = (formData: CompetitionClassForm) => {
    const newClass: LocalCompetitionClass = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: formData.name,
      description: formData.description,
      numberOfPhotos: formData.numberOfPhotos,
      topicStartIndex: formData.topicStartIndex || 0,
      isNew: true,
    };

    setLocalClasses((prev) => [...prev, newClass]);
    form.reset();
    setIsAddingClass(false);
    toast.success("Competition class added to queue!");
  };

  const handleRemoveClass = (classId: number | string) => {
    setLocalClasses((prev) => prev.filter((cc) => cc.id !== classId));

    // If it's an existing class (not new), add to deleted list
    if (typeof classId === "number") {
      setDeletedClassIds((prev) => [...prev, classId]);
    }

    toast.success("Competition class removed from queue!");
  };

  const handleContinue = () => {
    if (localClasses.length === 0) {
      toast.error("Please add at least one competition class");
      return;
    }

    // Check if there are any changes to save
    const hasNewClasses = localClasses.some((cc) => cc.isNew);
    const hasDeletedClasses = deletedClassIds.length > 0;

    if (hasNewClasses || hasDeletedClasses) {
      batchMutate();
    } else {
      onNext();
    }
  };

  const predefinedClasses = [
    {
      name: "8 hours",
      description: "Morning start time for 8 hour competition",
      numberOfPhotos: 8,
      topicStartIndex: 0,
    },
    {
      name: "24 hours",
      description: "All day competition with 24 photos",
      numberOfPhotos: 24,
      topicStartIndex: 0,
    },
    {
      name: "8 hours (Afternoon start)",
      description: "Afternoon start time for 8 hour competition",
      numberOfPhotos: 8,
      topicStartIndex: 8,
    },
  ];

  const addPredefinedClass = (
    predefinedClass: (typeof predefinedClasses)[0]
  ) => {
    const newClass: LocalCompetitionClass = {
      id: `temp-${Date.now()}`,
      name: predefinedClass.name,
      description: predefinedClass.description,
      numberOfPhotos: predefinedClass.numberOfPhotos,
      topicStartIndex: predefinedClass.topicStartIndex,
      isNew: true,
    };

    setLocalClasses((prev) => [...prev, newClass]);
  };

  const hasChanges =
    localClasses.some((cc) => cc.isNew) || deletedClassIds.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Competition Classes
          </CardTitle>
          <CardDescription className="">
            Create different categories for participants to compete in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Classes */}
          {localClasses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Classes</h3>
              <div className="grid gap-4">
                {localClasses.map((competitionClass) => (
                  <div
                    key={competitionClass.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-vimmer-primary" />
                      <div>
                        <h4 className="font-semibold">
                          {competitionClass.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {competitionClass.numberOfPhotos} photos required
                        </p>
                        {competitionClass.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {competitionClass.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveClass(competitionClass.id)}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {localClasses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No competition classes added yet.</p>
              <p className="text-sm">Add at least one class to continue.</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Add Common Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedClasses.map((predefinedClass, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => addPredefinedClass(predefinedClass)}
                  className="justify-start h-auto p-4 text-left"
                  disabled={
                    isSaving ||
                    localClasses.some((cc) => cc.name === predefinedClass.name)
                  }
                >
                  <div>
                    <div className="font-semibold">{predefinedClass.name}</div>
                    <div className="text-sm text-muted-foreground text-wrap font-normal pr-16">
                      {predefinedClass.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {predefinedClass.numberOfPhotos} photos
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Class Form */}
          {!isAddingClass ? (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setIsAddingClass(true)}
                className="gap-2"
                disabled={isSaving}
              >
                <Plus className="w-4 h-4" />
                Add Custom Class
              </Button>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Add Custom Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleAddClass)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Professional Category"
                              disabled={isSaving}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="For experienced photographers..."
                              rows={3}
                              disabled={isSaving}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="numberOfPhotos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Photos</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                disabled={isSaving}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="topicStartIndex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic Start Index</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                disabled={isSaving}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingClass(false);
                          form.reset();
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <PrimaryButton type="submit" disabled={isSaving}>
                        Add Class
                      </PrimaryButton>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={!canGoBack || isSaving}
            >
              Back
            </Button>
            <PrimaryButton
              onClick={handleContinue}
              disabled={localClasses.length === 0 || isSaving}
            >
              {isSaving ? "Saving..." : "Continue"}
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
