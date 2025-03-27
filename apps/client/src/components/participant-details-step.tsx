"use client";
import { initializeParticipant } from "@/lib/actions/initialize-participant";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { initializeParticipantSchema } from "@/lib/schemas/initialize-participant-schema";
import { StepNavigationHandlers } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
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
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { useRef } from "react";

interface Props extends StepNavigationHandlers {
  marathonId: number;
  domain: string;
}

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
    params: { participantId, participantRef },
    setParams,
  } = useSubmissionQueryState();

  const action = useAction(initializeParticipant, {
    onSuccess: async (result) => {
      const participantId = result.data?.id;
      const participantRef = result.data?.reference;
      if (!participantId || !participantRef) {
        return;
      }
      await setParams((prev) => ({
        ...prev,
        participantId,
        participantRef,
      }));
      onNextStep?.();
    },
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof initializeParticipantSchema
  >(action.result.validationErrors, { joinBy: "\n" });

  const form = useForm({
    resolver: zodResolver(initializeParticipantSchema),
    defaultValues: {
      participantRef: participantRef ?? "",
      firstname: "",
      lastname: "",
      email: "",
      marathonId,
      domain,
    },
    errors: hookFormValidationErrors,
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const disabledButton =
    !form.watch("firstname") || !form.watch("lastname") || !form.watch("email");

  const disabledInput = action.isPending || !!participantId;

  return (
    <div className="max-w-md mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-center ">
          Your Details
        </CardTitle>
        <CardDescription className="text-center">
          Please enter your personal information
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(action.executeAsync)}
          className="space-y-6"
        >
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
                      disabled={disabledInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          lastNameRef.current?.focus();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
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
                      disabled={disabledInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          emailRef.current?.focus();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
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
                      type="email"
                      className="rounded-xl text-lg py-6"
                      placeholder="your@email.com"
                      disabled={disabledInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !disabledButton) {
                          form.handleSubmit(action.executeAsync)();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {action.result.validationErrors ? (
              <Alert
                variant="destructive"
                className="flex items-center py-4 gap-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {Object.values(action.result.validationErrors)
                    .flatMap((error) =>
                      Array.isArray(error) ? error : error._errors || []
                    )
                    .join("\n")}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {participantId ? (
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={onNextStep}
              >
                Continue
              </Button>
            ) : (
              <>
                <PrimaryButton
                  type="submit"
                  className="w-full py-3 text-lg rounded-full"
                  disabled={disabledButton}
                >
                  {action.isPending ? "Verifying..." : "Continue"}
                  {!action.isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                </PrimaryButton>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onPrevStep}
                  className="w-full"
                >
                  Back
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Form>
    </div>
  );
}
