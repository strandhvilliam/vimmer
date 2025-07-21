"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Label } from "@vimmer/ui/components/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";

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

const PREDEFINED_CLASSES: CompetitionClassForm[] = [
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

interface OnboardingClassStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

type LocalCompetitionClass = {
  id: number | string;
  name: string;
  description?: string;
  numberOfPhotos: number;
  topicStartIndex: number;
  isNew?: boolean;
};

export function OnboardingClassStep({
  onNext,
  onPrev,
  canGoBack,
}: OnboardingClassStepProps) {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const queryClient = useQueryClient();
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [localClasses, setLocalClasses] = useState<LocalCompetitionClass[]>([]);
  const [deletedClassIds, setDeletedClassIds] = useState<number[]>([]);

  // Fetch marathon and competition classes data
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({ domain }),
  );

  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
  );

  // Fetch topics for topicStartIndex dropdown
  const { data: topics = [] } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({ domain }),
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
        })),
      );
    }
  }, [competitionClasses]);

  // Create competition class mutation
  const { mutate: createCompetitionClass } = useMutation(
    trpc.competitionClasses.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to add competition class");
      },
    }),
  );

  // Delete competition class mutation
  const { mutate: deleteCompetitionClass } = useMutation(
    trpc.competitionClasses.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to remove competition class");
      },
    }),
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
              },
            );
          }),
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
              },
            );
          }),
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

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      numberOfPhotos: 24,
      topicStartIndex: 0,
    },
    onSubmit: async ({ value }) => {
      handleAddClass(value);
    },
  });

  const handleAddClass = (formData: CompetitionClassForm) => {
    const result = competitionClassSchema.safeParse(formData);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    const newClass: LocalCompetitionClass = {
      id: `temp-${Date.now()}`,
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

    const hasNewClasses = localClasses.some((cc) => cc.isNew);
    const hasDeletedClasses = deletedClassIds.length > 0;

    if (hasNewClasses || hasDeletedClasses) {
      batchMutate();
    } else {
      onNext();
    }
  };

  const addPredefinedClass = (predefinedClass: CompetitionClassForm) => {
    const result = competitionClassSchema.safeParse(predefinedClass);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk">
            Competition Classes
          </CardTitle>
          <CardDescription className="">
            Set up the different classes or categories that participants can
            join in your competition. For example, you might have an "8 hours"
            or "24 hours" class. Add at least one class to continue. You can use
            the quick add buttons or create your own custom class below.
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
                        {competitionClass.topicStartIndex !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Start from topic:{" "}
                            {competitionClass.topicStartIndex + 1}
                          </p>
                        )}
                        {/* Warning if not enough topics for this class */}
                        {topics.length - competitionClass.topicStartIndex <
                          competitionClass.numberOfPhotos && (
                          <p className="text-sm text-red-600 mt-1">
                            Not enough topics for this class. Add more topics or
                            reduce the number of required photos.
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
              {PREDEFINED_CLASSES.map((predefinedClass) => (
                <div
                  key={predefinedClass.name}
                  className="flex items-center justify-between p-3 border rounded-lg transition-colors"
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPredefinedClass(predefinedClass)}
                    disabled={
                      isSaving ||
                      localClasses.some(
                        (cc) => cc.name === predefinedClass.name,
                      )
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
                      onChange: ({ value }) =>
                        !value ? "Class name is required" : undefined,
                    }}
                    children={(field) => (
                      <div>
                        <Label htmlFor={field.name}>Class Name</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Professional Category"
                          disabled={isSaving}
                        />
                        {field.state.meta.isTouched &&
                        field.state.meta.errors.length ? (
                          <p className="text-sm text-red-600 mt-1">
                            {field.state.meta.errors.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />

                  <form.Field
                    name="description"
                    children={(field) => (
                      <div>
                        <Label htmlFor={field.name}>
                          Description (Optional)
                        </Label>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="For experienced photographers..."
                          rows={3}
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="numberOfPhotos"
                      validators={{
                        onChange: ({ value }) => {
                          if (value < 1) return "Must require at least 1 photo";
                          if (value > 100) return "Cannot exceed 100 photos";
                          return undefined;
                        },
                      }}
                      children={(field) => (
                        <div>
                          <Label htmlFor={field.name}>Number of Photos</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            min="1"
                            max="100"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                            disabled={isSaving}
                          />
                          {field.state.meta.isTouched &&
                          field.state.meta.errors.length ? (
                            <p className="text-sm text-red-600 mt-1">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />

                    <form.Field
                      name="topicStartIndex"
                      validators={{
                        onChange: ({ value }) =>
                          value < 0
                            ? "Start index cannot be negative"
                            : undefined,
                      }}
                      children={(field) => (
                        <div>
                          <Label htmlFor={field.name}>Topic Start Index</Label>
                          <Select
                            value={
                              topics[field.state.value]
                                ? String(field.state.value)
                                : topics[0]
                                  ? "0"
                                  : ""
                            }
                            onValueChange={(val) => {
                              const idx = Number(val);
                              field.handleChange(idx);
                            }}
                            disabled={isSaving || topics.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic start" />
                            </SelectTrigger>
                            <SelectContent>
                              {topics.map((topic, idx) => (
                                <SelectItem key={topic.id} value={String(idx)}>
                                  {`${topic.orderIndex + 1}. ${topic.name}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.state.meta.isTouched &&
                          field.state.meta.errors.length ? (
                            <p className="text-sm text-red-600 mt-1">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          ) : null}
                        </div>
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
