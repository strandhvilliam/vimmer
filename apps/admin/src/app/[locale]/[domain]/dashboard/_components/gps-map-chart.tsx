"use client";

import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";

interface GpsLocation {
  id: number;
  x: number;
  y: number;
  z: number;
  name: string;
}

interface GpsMapChartProps {
  gpsData: GpsLocation[];
}

const MOCK_GPS_DATA: GpsLocation[] = [
  { id: 1, x: 55, y: 40, z: 12, name: "City Center" },
  { id: 2, x: 60, y: 35, z: 8, name: "Park" },
  { id: 3, x: 45, y: 60, z: 5, name: "Beach" },
  { id: 4, x: 40, y: 35, z: 10, name: "Mountain" },
  { id: 5, x: 25, y: 65, z: 6, name: "Lake" },
  { id: 6, x: 70, y: 50, z: 9, name: "Museum" },
  { id: 7, x: 30, y: 30, z: 4, name: "Bridge" },
  { id: 8, x: 65, y: 70, z: 7, name: "Cathedral" },
  { id: 9, x: 50, y: 50, z: 15, name: "Main Square" },
];

export function GpsMapChart() {
  const gpsData = MOCK_GPS_DATA;
  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          Photo Locations
        </CardTitle>
        <CardDescription className="text-xs">
          Geographic distribution of photos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[240px] relative">
          <div className="absolute inset-0 bg-gray-100 rounded-md overflow-hidden">
            <div className="w-full h-full grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 border-opacity-30"
                />
              ))}
            </div>

            {gpsData.map((location) => (
              <div
                key={location.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <MapPin
                  size={location.z + 14}
                  className="text-red-500 fill-current"
                />
                <span className="text-xs font-medium mt-1 bg-white px-1 rounded shadow-sm">
                  {location.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
