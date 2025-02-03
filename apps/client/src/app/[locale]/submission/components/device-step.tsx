"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Marathon } from "../page";

interface SubmissionNavigationProps {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

interface DeviceGroupSelectionProps extends SubmissionNavigationProps {
  deviceGroups: Marathon["deviceGroups"];
}

const DeviceIcons = {
  smartphone: Smartphone,
  camera: Camera,
};

export function DeviceGroupSelection({
  deviceGroups,
  onNextStep,
  onPrevStep,
}: DeviceGroupSelectionProps) {
  const [selectedDevice, setSelectedDevice] = useQueryState(
    "dg",
    parseAsInteger,
  );

  const handleContinue = () => {
    if (selectedDevice) {
      onNextStep?.();
    } else {
      console.error("No device selected");
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choose Your Device</h1>
        <p className="text-muted-foreground">
          Select the device you`&apos`ll use during the race
        </p>
      </div>

      <div className="flex gap-6 items-center justify-center">
        {deviceGroups.map((device) => {
          const IconComponent = DeviceIcons[device.icon];

          return (
            <motion.div
              key={device.id}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer w-[200px] transition-all h-full ${
                  selectedDevice === device.id
                    ? "border-2 border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedDevice(device.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{device.name}</CardTitle>
                    </div>
                    {selectedDevice === device.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <IconComponent className="h-6 w-6" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-center pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevStep}
          disabled={!selectedDevice}
          className=""
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedDevice}
          className="min-w-[200px]"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
