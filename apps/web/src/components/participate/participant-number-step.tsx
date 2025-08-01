"use client";

import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@vimmer/ui/components/button";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Marathon } from "@vimmer/api/db/types";
import { useDomain } from "@/contexts/domain-context";
import { z } from "zod/v4";
import { useI18n } from "@/locales/client";

const createInitializeParticipantSchema = (t: ReturnType<typeof useI18n>) =>
  z.object({
    participantRef: z
      .string()
      .nonempty({ message: t("participantNumber.required") })
      .refine((val) => /^\d+$/.test(val), {
        message: t("participantNumber.numbersOnly"),
      }),
    domain: z.string().min(1, "Invalid domain"),
  });

interface Props extends StepNavigationHandlers {
  marathon: Marathon;
}

export function ParticipantNumberStep({ onNextStep, marathon }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();
  const t = useI18n();
  const {
    submissionState: { participantRef, participantId },
    setSubmissionState,
  } = useSubmissionQueryState();

  const form = useForm({
    defaultValues: {
      participantRef: participantRef ?? "",
      domain,
    },
    onSubmit: async ({ value }) => {
      createParticipant({
        data: {
          ...value,
          reference: value.participantRef.padStart(4, "0"),
          marathonId: marathon.id,
        },
      });
    },
    validators: {
      onChange: createInitializeParticipantSchema(t),
    },
  });

  const { mutate: createParticipant } = useMutation(
    trpc.participants.create.mutationOptions({
      onSuccess: async ({ id }, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.participants.getByDomain.queryKey({
            domain,
          }),
        });
        await setSubmissionState((prev) => ({
          ...prev,
          participantId: id,
          participantRef: variables.data.reference,
        }));
        onNextStep?.();
      },
      onError: (error) => {
        if (error.data?.code === "BAD_REQUEST") {
          console.log("error", error.message);
          form.setErrorMap({
            onChange: {
              fields: {
                participantRef: {
                  message: t("participantNumber.participantExists"),
                },
              },
            },
          });
        } else {
          toast.error(t("participantNumber.createFailed"));
        }
      },
    }),
  );

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          {t("participantNumber.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("participantNumber.description")}
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
          <div>
            <form.Field
              name="participantRef"
              children={(field) => (
                <>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234"
                    className="text-center text-4xl h-16 bg-background tracking-widest"
                    disabled={!!participantId}
                    maxLength={4}
                    value={field.state.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = value.replace(/\D/g, "").slice(0, 4);
                      field.handleChange(numericValue);
                    }}
                    onBlur={() => {
                      if (field.state.value && field.state.value.length > 0) {
                        const paddedValue = field.state.value.padStart(4, "0");
                        field.handleChange(paddedValue);
                      }
                      field.handleBlur();
                    }}
                  />
                  {field.state.meta.errors &&
                    form.state.isSubmitted &&
                    field.state.meta.errors.length > 0 && (
                      <span className="flex flex-1 w-full justify-center text-center text-base pt-4 text-destructive font-medium">
                        {field.state.meta.errors[0]?.message}
                      </span>
                    )}
                </>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {participantId ? (
            <Button
              type="button"
              className="w-full rounded-full py-6 text-lg"
              onClick={onNextStep}
            >
              {t("participantNumber.continue")}
            </Button>
          ) : (
            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.values.participantRef,
              ]}
              children={([canSubmit, isSubmitting, participantRefValue]) => (
                <PrimaryButton
                  type="submit"
                  className="w-full py-3 text-lg rounded-full"
                  disabled={!canSubmit || !participantRefValue}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <span>{t("participantNumber.continue")}</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </PrimaryButton>
              )}
            />
          )}
        </CardFooter>
      </form>
    </div>
  );
}
