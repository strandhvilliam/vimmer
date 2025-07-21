"use client";

import { StepNavigationHandlers } from "@/lib/types";
import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Loader2 } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { DeviceGroup } from "@vimmer/api/db/types";
import { DeviceSelectionItem } from "./device-selection-item";

interface Props extends StepNavigationHandlers {
  deviceGroups: DeviceGroup[];
}

export function DeviceSelectionStep({
  deviceGroups,
  onNextStep,
  onPrevStep,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();
  const {
    submissionState: {
      competitionClassId,
      deviceGroupId,
      participantId,
      participantFirstName,
      participantLastName,
      participantEmail,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const { mutate: updateParticipant, isPending: isUpdateParticipantPending } =
    useMutation(
      trpc.participants.update.mutationOptions({
        onSuccess: async ({ id }) => {
          queryClient.invalidateQueries({
            queryKey: trpc.participants.getByDomain.queryKey({
              domain,
            }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.participants.getById.queryKey({
              id,
            }),
          });
          onNextStep?.();
        },
      }),
    );

  const isValid =
    deviceGroupId &&
    competitionClassId &&
    participantId &&
    participantFirstName &&
    participantLastName &&
    participantEmail;

  const handleContinue = () => {
    updateParticipant({
      id: participantId!,
      data: {
        competitionClassId: competitionClassId!,
        deviceGroupId: deviceGroupId!,
        status: "ready_to_upload",
        firstname: participantFirstName!,
        lastname: participantLastName!,
        email: participantEmail!,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          Choose Your Device
        </CardTitle>
        <CardDescription className="text-center">
          Select the device you've used during the marathon
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {deviceGroups.map((deviceGroup) => (
          <DeviceSelectionItem
            key={deviceGroup.id}
            deviceGroup={deviceGroup}
            isSelected={deviceGroupId === deviceGroup.id}
            onSelect={() =>
              setSubmissionState({ deviceGroupId: deviceGroup.id })
            }
          />
        ))}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 items-center justify-center pt-4 px-4 sm:px-0">
        <PrimaryButton
          onClick={handleContinue}
          disabled={!isValid || isUpdateParticipantPending}
          className="w-full py-3 text-lg rounded-full"
        >
          {isUpdateParticipantPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Continue"
          )}
        </PrimaryButton>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          className="w-[200px]"
        >
          Back
        </Button>
      </CardFooter>
    </div>
  );
}
