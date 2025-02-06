import { initializeParticipant } from "@/lib/actions/initialize-participant";
import { initParticipantSchema } from "@/lib/schemas/init-participant-schema";
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
import { Form, FormItem } from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { StepNavigationHandlers } from "../client-page";

interface Props extends StepNavigationHandlers {
  marathonId: number;
}

const PARTICIPANT_REF_LENGTH = 4;

export default function ParticipantRegistration({
  onNextStep,
  marathonId,
}: Props) {
  const [participantRefQuery, setParticipantReference] = useQueryState(
    "pr",
    parseAsString.withDefault(""),
  );
  const [participantId, setParticipantId] = useQueryState(
    "pid",
    parseAsInteger,
  );

  const action = useAction(initializeParticipant, {
    onSuccess: async (result) => {
      if (!result.data) {
        return;
      }
      await Promise.all([
        setParticipantId(result.data.id),
        setParticipantReference(result.data.reference),
      ]);
      onNextStep?.();
    },
  });
  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof initParticipantSchema
  >(action.result.validationErrors, { joinBy: "\n" });
  const form = useForm({
    resolver: zodResolver(initParticipantSchema),
    defaultValues: {
      participantRef: participantRefQuery,
      marathonId,
    },
    errors: hookFormValidationErrors,
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const disabledButton =
    form.watch("participantRef")?.length !== PARTICIPANT_REF_LENGTH;

  const disabledInput = action.isPending || !!participantId;

  return (
    <div className="max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold text-center">
          Enter Your Participant Number
        </CardTitle>
        <CardDescription className="text-center">
          Please enter the {PARTICIPANT_REF_LENGTH}-digit number from your
          registration confirmation
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(action.executeAsync)}
          className="space-y-2"
        >
          <CardContent className="space-y-4">
            <FormItem>
              <Input
                {...form.register("participantRef")}
                type="text"
                disabled={disabledInput}
                placeholder={`Enter ${PARTICIPANT_REF_LENGTH}-digit number`}
                className="text-center text-lg tracking-wider border-muted-foreground"
                maxLength={PARTICIPANT_REF_LENGTH}
              />
            </FormItem>
            {form.formState.errors.participantRef ? (
              <Alert
                variant="destructive"
                className="flex items-center py-4 gap-4"
              >
                <div>
                  <AlertCircle size={16} />
                </div>
                <AlertDescription>
                  {form.formState.errors.participantRef.message}
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
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={disabledButton}
              >
                {action.isPending ? "Verifying..." : "Continue"}
                {!action.isPending && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </div>
  );
}
