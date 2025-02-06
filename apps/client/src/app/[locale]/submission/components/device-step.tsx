"use client";

import { DeviceGroup } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Smartphone } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { StepNavigationHandlers } from "../client-page";

interface DeviceGroupSelectionProps extends StepNavigationHandlers {
  deviceGroups: DeviceGroup[];
}

export function DeviceGroupSelection({
  deviceGroups,
  onNextStep,
  onPrevStep,
}: DeviceGroupSelectionProps) {
  const [selectedDevice, setSelectedDevice] = useQueryState(
    "dg",
    parseAsInteger,
  );

  const getDeviceIcon = (icon: string) => {
    switch (icon) {
      case "smartphone":
        return <Smartphone className="size-10" />;
      case "camera":
      default:
        return <Camera className="size-10" />;
    }
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
                selectedDevice === device.id
                  ? "border-2 border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedDevice(device.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {device.name}
                  {selectedDevice === device.id && (
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
          onClick={onNextStep}
          disabled={!selectedDevice}
          className="w-[200px]"
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          disabled={!selectedDevice}
          className="w-[200px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
