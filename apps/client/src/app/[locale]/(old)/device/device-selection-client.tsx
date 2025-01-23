"use client";

import { Badge } from "@vimmer/ui/components/badge";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Battery,
  Camera,
  CheckCircle2,
  Smartphone,
  Tablet,
  Watch,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Device {
  id: string;
  name: string;
  description: string;
  icon: "smartphone" | "camera" | "watch" | "tablet";
  batteryLife: string;
  compatibility: string[];
}

interface DeviceSelectionClientProps {
  devices: Device[];
}

const DeviceIcons = {
  smartphone: Smartphone,
  camera: Camera,
  watch: Watch,
  tablet: Tablet,
};

export function DeviceSelectionClient({ devices }: DeviceSelectionClientProps) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleContinue = () => {};

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map((device) => {
          const IconComponent = DeviceIcons[device.icon];

          return (
            <motion.div
              key={device.id}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all h-full ${
                  selectedDevice === device.id
                    ? "border-2 border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedDevice(device.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-6 w-6" />
                      <CardTitle>{device.name}</CardTitle>
                    </div>
                    {selectedDevice === device.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {device.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Battery className="h-4 w-4" />
                    <span className="text-muted-foreground">
                      {device.batteryLife}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {device.compatibility.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Link href="/submit" className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedDevice}
          className="min-w-[200px]"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </motion.div>
  );
}
