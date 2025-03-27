"use client";
import { PARTICIPANT_REF_LENGTH } from "@/lib/constants";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@vimmer/ui/components/input-otp";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";

const participantNumberSchema = z.object({
  participantRef: z
    .string()
    .length(PARTICIPANT_REF_LENGTH, "Invalid participant number"),
});

type FormValues = z.infer<typeof participantNumberSchema>;

interface Props extends StepNavigationHandlers {
  marathonId: number;
}

export function ParticipantNumberStep({ onNextStep }: Props) {
  const participantRefRef = useRef<HTMLInputElement>(null);
  const {
    params: { participantRef },
    setParams,
  } = useSubmissionQueryState();

  const form = useForm<FormValues>({
    resolver: zodResolver(participantNumberSchema),
    defaultValues: {
      participantRef: participantRef ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await setParams((prev) => ({
      ...prev,
      participantRef: data.participantRef,
    }));
    onNextStep?.();
  };

  const disabledButton =
    form.watch("participantRef")?.length !== PARTICIPANT_REF_LENGTH;

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold text-center">
          Your Participant Number
        </CardTitle>
        <CardDescription className="text-center">
          Please enter your participant number to continue
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="participantRef"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      {...field}
                      ref={participantRefRef}
                      value={value}
                      onChange={(value) => {
                        onChange(value);
                        if (value.length === PARTICIPANT_REF_LENGTH) {
                          participantRefRef.current?.blur();
                        }
                      }}
                      maxLength={PARTICIPANT_REF_LENGTH}
                      containerClassName="gap-6 flex-row justify-center"
                    >
                      <InputOTPGroup className="">
                        <InputOTPSlot
                          className="size-16 bg-background text-3xl"
                          index={0}
                        />
                        <InputOTPSlot
                          className="size-16 bg-background text-3xl"
                          index={1}
                        />
                        <InputOTPSlot
                          className="size-16 bg-background text-3xl"
                          index={2}
                        />
                        <InputOTPSlot
                          className="size-16 bg-background text-3xl"
                          index={3}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
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
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </CardFooter>
        </form>
      </Form>
    </div>
  );
}
