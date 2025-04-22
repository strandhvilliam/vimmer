"use client";

import { PARTICIPANT_REF_LENGTH } from "@/lib/constants";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@vimmer/ui/components/input-otp";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { ArrowRight, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { initializeParticipant } from "@/actions/initialize-participant";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  InitializeParticipantSchema,
  initializeParticipantSchema,
} from "@/schemas/initialize-participant-schema";
import { Button } from "@vimmer/ui/components/button";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props extends StepNavigationHandlers {
  marathonId: number;
  domain: string;
}

// Define the shape of the form data using the Zod schema
type ParticipantNumberSchema = z.infer<typeof initializeParticipantSchema>;

export function ParticipantNumberStep({
  onNextStep,
  marathonId,
  domain,
}: Props) {
  const participantRefRef = useRef<HTMLInputElement>(null);
  const {
    submissionState: { participantRef, participantId },
    setSubmissionState,
  } = useSubmissionQueryState();

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InitializeParticipantSchema>({
    resolver: zodResolver(initializeParticipantSchema),
    defaultValues: {
      participantRef: participantRef ?? "",
      marathonId,
      domain,
    },
  });

  const { execute: initializeParticiantAction, isExecuting } = useAction(
    initializeParticipant,
    {
      onSuccess: async (result) => {
        const participantRef = result.data?.reference;
        const participantId = result.data?.id;
        if (!participantRef || !participantId) return;
        await setSubmissionState((prev) => ({
          ...prev,
          participantRef,
          participantId,
        }));
        onNextStep?.();
      },
      onError: ({ error: { validationErrors, serverError } }) => {
        if (validationErrors) {
          setError("participantRef", {
            message:
              validationErrors.participantRef?._errors?.[0] ??
              "Invalid participant number",
          });
        }
        if (serverError) {
          toast.error(serverError);
        }
      },
    }
  );

  const participantRefValue = watch("participantRef");
  const disabledButton = participantRefValue?.length !== PARTICIPANT_REF_LENGTH;

  const handleChange = (value: string) => {
    setValue("participantRef", value);
    if (value.length === PARTICIPANT_REF_LENGTH) {
      clearErrors("participantRef");
      participantRefRef.current?.blur();
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          Your Participant Number
        </CardTitle>
        <CardDescription className="text-center">
          Please enter your participant number to continue
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={handleSubmit(initializeParticiantAction)}
        className="space-y-6"
      >
        <CardContent className="space-y-6">
          <div>
            <InputOTP
              ref={participantRefRef}
              inputMode="numeric"
              onChange={handleChange}
              maxLength={PARTICIPANT_REF_LENGTH}
              containerClassName="gap-6 flex-row justify-center"
              disabled={!!participantId}
            >
              <InputOTPGroup className="">
                {Array.from({ length: PARTICIPANT_REF_LENGTH }).map(
                  (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="size-16 bg-background text-3xl"
                    />
                  )
                )}
              </InputOTPGroup>
            </InputOTP>

            {errors.participantRef && (
              <span className="flex flex-1 w-full justify-center text-center text-base pt-4 text-destructive font-medium">
                {errors.participantRef.message}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {participantId ? (
            <Button
              type="button"
              className="w-full rounded-full py-6 text-lg"
              onClick={onNextStep}
              disabled={isExecuting}
            >
              Continue
            </Button>
          ) : (
            <PrimaryButton
              type="submit"
              className="w-full py-3 text-lg rounded-full"
              disabled={disabledButton}
            >
              {isExecuting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </PrimaryButton>
          )}
        </CardFooter>
      </form>
    </div>
  );
}
