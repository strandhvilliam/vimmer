"use client";
import { updateParticipantDetails } from "@/actions/update-participant-details";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@vimmer/ui/components/alert";
import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
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
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { z } from "zod";

interface Props extends StepNavigationHandlers {
  marathonId: number;
  domain: string;
}

const participantDetailsSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

type ParticipantDetailsSchema = z.infer<typeof participantDetailsSchema>;

export function ParticipantDetailsStep({
  onNextStep,
  onPrevStep,
  marathonId,
  domain,
}: Props) {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const {
    submissionState: {
      participantEmail,
      participantFirstName,
      participantLastName,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const form = useForm<ParticipantDetailsSchema>({
    resolver: zodResolver(participantDetailsSchema),
    defaultValues: {
      firstname: participantFirstName ?? "",
      lastname: participantLastName ?? "",
      email: participantEmail ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const handleSubmit = async (data: ParticipantDetailsSchema) => {
    await setSubmissionState((prev) => ({
      ...prev,
      participantFirstName: data.firstname,
      participantLastName: data.lastname,
      participantEmail: data.email,
    }));
    onNextStep?.();
  };

  const disabledButton =
    !form.watch("firstname") || !form.watch("lastname") || !form.watch("email");

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={firstNameRef}
                      className="rounded-xl text-lg py-6"
                      placeholder="James"
                    />
                  </FormControl>
                  {form.formState.errors.firstname && (
                    <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                      {form.formState.errors.firstname.message}
                    </span>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={lastNameRef}
                      className="rounded-xl text-lg py-6"
                      placeholder="Bond"
                    />
                  </FormControl>
                  {form.formState.errors.lastname && (
                    <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                      {form.formState.errors.lastname.message}
                    </span>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={emailRef}
                      className="rounded-xl text-lg py-6"
                      placeholder="your@email.com"
                    />
                  </FormControl>
                  {form.formState.errors.email && (
                    <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                      {form.formState.errors.email.message}
                    </span>
                  )}
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <PrimaryButton
              type="submit"
              className="w-full py-3 text-lg rounded-full"
              disabled={disabledButton}
            >
              <span>Continue</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
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
      </Form>
    </div>
  );
}
