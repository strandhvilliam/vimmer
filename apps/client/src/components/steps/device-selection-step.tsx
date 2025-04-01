"use client";

import { readyParticipant } from "@/lib/actions/ready-participant";
import { StepNavigationHandlers } from "@/lib/types";
import { DeviceGroup } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsInteger, useQueryStates } from "nuqs";
import { cn } from "@vimmer/ui/lib/utils";
import { Icon } from "@iconify/react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";

interface Props extends StepNavigationHandlers {
  deviceGroups: DeviceGroup[];
}

export function DeviceSelectionStep({
  deviceGroups,
  onNextStep,
  onPrevStep,
}: Props) {
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

  const {
    execute: readyParticipantAction,
    isPending: isReadyParticipantPending,
  } = useAction(readyParticipant, {
    onSuccess: async () => onNextStep?.(),
    onError: (error) => {
      console.log("error", error);
      toast.error(error.error.serverError);
    },
  });

  const isValid =
    deviceGroupId &&
    competitionClassId &&
    participantId &&
    participantFirstName &&
    participantLastName &&
    participantEmail;

  const handleContinue = () => {
    readyParticipantAction({
      participantId: participantId!,
      competitionClassId: competitionClassId!,
      deviceGroupId: deviceGroupId!,
      firstname: participantFirstName!,
      lastname: participantLastName!,
      email: participantEmail!,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-center ">
          Choose Your Device
        </CardTitle>
        <CardDescription className="text-center">
          Select the device you'll use during the race
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {deviceGroups.map((deviceGroup) => (
          <DeviceGroupItem
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
          disabled={!isValid || isReadyParticipantPending}
          className="w-full py-3 text-lg rounded-full"
        >
          {isReadyParticipantPending ? (
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

function DeviceGroupItem({
  deviceGroup,
  isSelected,
  onSelect,
}: {
  deviceGroup: DeviceGroup;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case "smartphone":
        return (
          <Icon
            icon="solar:smartphone-broken"
            className="w-16 h-16"
            style={{ transform: "rotate(-5deg)" }}
          />
        );
      case "camera":
      default:
        return (
          <Icon
            icon="solar:camera-minimalistic-broken"
            className="w-16 h-16"
            style={{ transform: "rotate(-5deg)" }}
          />
        );
    }
  };

  return (
    <motion.div
      key={deviceGroup.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card
        className={cn(
          "relative cursor-pointer overflow-hidden transition-all duration-200",
          isSelected && "ring-2 ring-primary/20 shadow-lg"
        )}
        onClick={onSelect}
      >
        <motion.div
          className="flex items-center p-4"
          animate={{
            backgroundColor: isSelected
              ? "rgba(var(--primary), 0.03)"
              : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              "flex items-center justify-center w-20 h-20 rounded-2xl transition-colors duration-200",
              isSelected ? "bg-primary/10" : "bg-muted/50"
            )}
            layout
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <motion.div
              className={cn(
                "transition-colors duration-200",
                isSelected ? "text-primary" : "text-foreground/80"
              )}
              whileHover={{ scale: 1.1, rotate: 0 }}
              initial={{ rotate: -5 }}
              layout
            >
              {getDeviceIcon(deviceGroup.icon)}
            </motion.div>
          </motion.div>

          <div className="flex-1 ml-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {deviceGroup.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  ID: {deviceGroup.id}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1 : 0,
                  opacity: isSelected ? 1 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
