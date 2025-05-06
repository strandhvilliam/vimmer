"use client";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useForm, FieldValues } from "react-hook-form";
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
  const {
    submissionState: {
      participantEmail,
      participantFirstName,
      participantLastName,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ParticipantDetailsSchema>({
    resolver: zodResolver(participantDetailsSchema),
    defaultValues: {
      firstname: participantFirstName ?? "",
      lastname: participantLastName ?? "",
      email: participantEmail ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmit = async (data: FieldValues) => {
    await setSubmissionState((prev) => ({
      ...prev,
      participantFirstName: data.firstname,
      participantLastName: data.lastname,
      participantEmail: data.email,
    }));
    onNextStep?.();
  };

  const disabledButton = !isValid;

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              First Name
            </label>
            <Input
              {...register("firstname")}
              className="rounded-xl text-lg py-6"
              placeholder="James"
            />
            {errors.firstname && (
              <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                {errors.firstname.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Last Name
            </label>
            <Input
              {...register("lastname")}
              className="rounded-xl text-lg py-6"
              placeholder="Bond"
            />
            {errors.lastname && (
              <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                {errors.lastname.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Email Address
            </label>
            <Input
              {...register("email")}
              className="rounded-xl text-lg py-6"
              placeholder="your@email.com"
            />
            {errors.email && (
              <span className="flex flex-1 w-full justify-center text-center text-base text-destructive font-medium">
                {errors.email.message}
              </span>
            )}
          </div>
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
    </div>
  );
}
