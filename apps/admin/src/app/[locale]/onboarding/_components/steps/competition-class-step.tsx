"use client";

import { useState } from "react";
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
import { Badge } from "@vimmer/ui/components/badge";
import { Trophy, Plus, X, Camera } from "lucide-react";
import { useOnboarding } from "../onboarding-context";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

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

export function CompetitionClassStep({
  onNext,
  onPrev,
  canGoBack,
}: CompetitionClassStepProps) {
  const { data, addCompetitionClass, removeCompetitionClass } = useOnboarding();
  const [isAddingClass, setIsAddingClass] = useState(false);

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
    const newClass = {
      id: Date.now(), // Temporary ID for UI purposes
      ...formData,
      marathonId: data.marathonConfig.id || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCompetitionClass(newClass as any);
    form.reset();
    setIsAddingClass(false);
  };

  const handleContinue = () => {
    onNext();
  };

  const predefinedClasses = [
    {
      name: "8 hours",
      description:
        "For photographers who want to compete in the 8 hour category",
      numberOfPhotos: 8,
      topicStartIndex: 0,
    },
    {
      name: "24 hours",
      description:
        "For photographers who want to compete in the 24 hour category",
      numberOfPhotos: 24,
      topicStartIndex: 0,
    },
    {
      name: "8 hours (Second Day)",
      description:
        "For photographers who want to compete in the 8 hour category on the second day",
      numberOfPhotos: 8,
      topicStartIndex: 8,
    },
  ];

  const addPredefinedClass = (
    predefinedClass: (typeof predefinedClasses)[0]
  ) => {
    const newClass = {
      id: Date.now(),
      ...predefinedClass,
      marathonId: data.marathonConfig.id || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addCompetitionClass(newClass as any);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl">
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
          {data.competitionClasses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Classes</h3>
              <div className="grid gap-4">
                {data.competitionClasses.map((competitionClass) => (
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
                      onClick={() =>
                        removeCompetitionClass(competitionClass.id)
                      }
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.competitionClasses.length === 0 && (
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
                  disabled={data.competitionClasses.some(
                    (cc) => cc.name === predefinedClass.name
                  )}
                >
                  <div>
                    <div className="font-semibold">{predefinedClass.name}</div>
                    <div className="text-sm text-muted-foreground text-wrap font-normal pr-16">
                      {predefinedClass.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {predefinedClass.numberOfPhotos} photos
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Class</h3>
              {!isAddingClass && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingClass(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Class
                </Button>
              )}
            </div>

            {isAddingClass && (
              <Card className="border-0 shadow-xl">
                <CardContent className="pt-6">
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
                                placeholder="Professional Class"
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
                                placeholder="For professional photographers with advanced equipment..."
                                className="resize-none"
                                rows={2}
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
                              <FormLabel>Number of Photos Required</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  {...field}
                                  onChange={(e) =>
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
                          name="topicStartIndex"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Topic Start Index</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          Add Class
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingClass(false);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={!canGoBack}
            >
              Back
            </Button>
            <PrimaryButton
              onClick={handleContinue}
              disabled={data.competitionClasses.length === 0}
            >
              Continue
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
