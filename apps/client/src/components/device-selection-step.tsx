"use client";

import { readyParticipant } from "@/lib/actions/ready-participant";
import { StepNavigationHandlers } from "@/lib/types";
import { DeviceGroup } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Smartphone } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsInteger, useQueryStates } from "nuqs";

interface Props extends StepNavigationHandlers {
  deviceGroups: DeviceGroup[];
}

export function DeviceSelectionStep({
  deviceGroups,
  onNextStep,
  onPrevStep,
}: Props) {
  const [params, setParams] = useQueryStates({
    cc: parseAsInteger,
    dg: parseAsInteger,
    pid: parseAsInteger,
  });

  const action = useAction(readyParticipant, {
    onSuccess: async () => onNextStep?.(),
    onError: (error) => {
      console.log("error", error);
      toast({
        title: "Error",
        description: error.error.serverError,
      });
    },
  });

  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case "smartphone":
        return <Smartphone className="size-10" />;
      case "camera":
      default:
        return <Camera className="size-10" />;
    }
  };

  const handleContinue = () => {
    if (!params.dg || !params.cc || !params.pid) {
      toast({
        title: "Error",
        description: "Please make sure you have selected all the options",
      });
      return;
    }
    action.execute({
      participantId: params.pid,
      competitionClassId: params.cc,
      deviceGroupId: params.dg,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choose Your Device</h1>
        <p className="text-muted-foreground">
          Select the device you`&apos`ll use during the race
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {deviceGroups.map((device) => (
          <motion.div
            key={device.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-[300px]"
          >
            <Card
              className={`cursor-pointer transition-colors h-full ${
                params.dg === device.id
                  ? "border-2 border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setParams((prev) => ({ ...prev, dg: device.id }))}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {device.name}
                  {params.dg === device.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </CardTitle>
                <CardContent className="space-y-4">
                  {getDeviceIcon(device.icon)}
                </CardContent>
              </CardHeader>
              <CardFooter className="mt-auto">
                <span className="text-xs text-muted-foreground ml-auto">
                  ID: {device.id}
                </span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col w-full items-center gap-2 justify-center pt-6">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!params.dg || !params.cc || action.isPending}
          className="w-[200px]"
        >
          {action.isPending ? "Loading..." : "Continue"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          className="w-[200px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
