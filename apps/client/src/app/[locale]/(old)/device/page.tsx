import { Suspense } from "react";
import { DeviceSelectionClient } from "./device-selection-client";

interface Device {
  id: string;
  name: string;
  description: string;
  icon: "smartphone" | "camera" | "watch" | "tablet";
  batteryLife: string;
  compatibility: string[];
}

// This would be replaced with actual data fetching
async function getDevices(): Promise<Device[]> {
  return [
    {
      id: "smartphone",
      name: "Smartphone",
      description:
        "Track your marathon using your phone's GPS. Perfect for runners who want to travel light.",
      icon: "smartphone",
      batteryLife: "Up to 12 hours",
      compatibility: ["iOS", "Android"],
    },
    {
      id: "sportwatch",
      name: "Sports Watch",
      description:
        "Dedicated sports watch with enhanced accuracy and extended battery life.",
      icon: "watch",
      batteryLife: "Up to 24 hours",
      compatibility: ["All GPS-enabled sports watches"],
    },
    {
      id: "camera",
      name: "Action Camera",
      description:
        "Record your journey with a rugged action camera. Great for creating memories.",
      icon: "camera",
      batteryLife: "Up to 8 hours",
      compatibility: ["GoPro", "DJI Action", "Other action cameras"],
    },
  ];
}

export default async function DeviceSelectionPage() {
  const devices = await getDevices();

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <Suspense fallback={<DeviceSelectionSkeleton />}>
        <DeviceSelectionClient devices={devices} />
      </Suspense>
    </div>
  );
}

function DeviceSelectionSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-lg border-2 border-slate-200 p-6 animate-pulse"
          >
            <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
