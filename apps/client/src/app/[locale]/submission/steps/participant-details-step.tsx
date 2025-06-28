"use client";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { useForm } from "@tanstack/react-form";
import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { ArrowRight } from "lucide-react";
import { z } from "zod/v4";

const participantDetailsSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
});

type ParticipantDetailsSchema = z.infer<typeof participantDetailsSchema>;

export function ParticipantDetailsStep({
  onNextStep,
  onPrevStep,
}: StepNavigationHandlers) {
  const {
    submissionState: {
      participantEmail,
      participantFirstName,
      participantLastName,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const form = useForm({
    defaultValues: {
      firstname: participantFirstName ?? "",
      lastname: participantLastName ?? "",
      email: participantEmail ?? "",
    } satisfies ParticipantDetailsSchema,
    onSubmit: async ({ value }) => {
      await setSubmissionState((prev) => ({
        ...prev,
        participantFirstName: value.firstname,
        participantLastName: value.lastname,
        participantEmail: value.email,
      }));
      onNextStep?.();
    },
    validators: {
      onChange: participantDetailsSchema,
      onMount: participantDetailsSchema,
    },
  });

  return (
    <div className="max-w-md mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          Your Details
        </CardTitle>
        <CardDescription className="text-center">
          Please enter your personal information
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <CardContent className="space-y-6">
          <form.Field
            name="firstname"
            children={(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  First Name
                </label>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl text-lg py-6"
                  placeholder="James"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <span className="flex flex-1 w-full justify-center text-sm text-center  text-destructive font-medium">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
              </div>
            )}
          />

          <form.Field
            name="lastname"
            children={(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Last Name
                </label>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl text-lg py-6"
                  placeholder="Bond"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <span className="flex flex-1 w-full justify-center text-sm text-center  text-destructive font-medium">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
              </div>
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Email Address
                </label>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl text-lg py-6"
                  type="email"
                  placeholder="your@email.com"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <span className="flex flex-1 w-full justify-center text-sm text-center  text-destructive font-medium">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
              </div>
            )}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit]) => (
              <PrimaryButton
                type="submit"
                className="w-full py-3 text-lg rounded-full"
                disabled={!canSubmit}
              >
                <span>Continue</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </PrimaryButton>
            )}
          />
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevStep}
            className="w-full"
          >
            Back
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
