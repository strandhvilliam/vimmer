"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@vimmer/ui/components/chart";
import { MapPin } from "lucide-react";

interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

interface StatDataPoint {
  name: string;
  value: number;
}

interface GpsLocation {
  id: number;
  x: number; // longitude
  y: number; // latitude
  z: number; // for bubble size (e.g. number of photos)
  name: string; // location name or photo ID
}

interface DashboardChartsProps {
  chartType?: "timeSeries" | "deviceGroup" | "class" | "gpsMap";
  timeSeriesData: TimeSeriesDataPoint[];
  deviceGroupStats: StatDataPoint[];
  classStats: StatDataPoint[];
  statusCounts: Record<string, number>;
  gpsData?: GpsLocation[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FDBFE6",
  "#D0ED57",
];

// Mock GPS data - representing common photo locations
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

export function DashboardCharts({
  chartType = "timeSeries",
  timeSeriesData,
  deviceGroupStats,
  classStats,
  gpsData = MOCK_GPS_DATA,
}: DashboardChartsProps) {
  // Render Registration Timeline Chart
  if (chartType === "timeSeries") {
    // Chart config for time series
    const timeSeriesConfig = {
      count: {
        label: "Registrations",
        color: "#0088FE",
      },
    };

    return (
      <Card>
        <CardHeader className="space-y-0 p-4 pb-0">
          <CardTitle className="text-base font-rocgrotesk">
            Registrations Over Time
          </CardTitle>
          <CardDescription className="text-xs">
            Number of participant registrations by date
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pb-0">
          <ChartContainer
            config={timeSeriesConfig}
            className="h-[240px] w-full"
          >
            <LineChart
              data={timeSeriesData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e0e0e0"
                strokeOpacity={0.6}
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                height={60}
                tickFormatter={(date) => {
                  const [year, month, day] = date.split("-");
                  return `${day}/${month}`;
                }}
              />
              {/* <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toString()}
              /> */}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      const [year, month, day] = label.split("-");
                      return `Date: ${day}/${month}/${year}`;
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // Render Device Group Chart
  if (chartType === "deviceGroup") {
    // Create chart config from deviceGroupStats
    const deviceConfig = deviceGroupStats.reduce(
      (config, stat, index) => {
        config[stat.name] = {
          label: stat.name,
          color: COLORS[index % COLORS.length] || "#8884d8",
        };
        return config;
      },
      {} as Record<string, { label: string; color: string }>
    );

    return (
      <Card>
        <CardHeader className="space-y-0 p-4 pb-0">
          <CardTitle className="text-base font-rocgrotesk">
            Device Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Participants by device group
          </CardDescription>
        </CardHeader>
        <ChartContainer config={deviceConfig} className="h-[140px] w-full">
          <PieChart className="relative">
            <Pie
              data={deviceGroupStats}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              nameKey="name"
              labelLine={false}
            >
              <LabelList
                dataKey="value"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                className="fill-background"
              />
              {deviceGroupStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length] || "#8884d8"}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <ChartLegend
              className="absolute bottom-4 right-4 max-w-[100px] flex-wrap gap-2 justify-end"
              content={<ChartLegendContent />}
            />
          </PieChart>
        </ChartContainer>
      </Card>
    );
  }

  // Render Competition Class Chart
  if (chartType === "class") {
    // Create chart config from classStats
    const classConfig = classStats.reduce(
      (config, stat, index) => {
        config[stat.name] = {
          label: stat.name,
          color: COLORS[index % COLORS.length] || "#8884d8",
        };
        return config;
      },
      {} as Record<string, { label: string; color: string }>
    );

    return (
      <Card>
        <CardHeader className="space-y-0 p-4 pb-0">
          <CardTitle className="text-base font-rocgrotesk">
            Competition Classes
          </CardTitle>
          <CardDescription className="text-xs">
            Participants by competition class
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={classConfig} className="h-[140px] w-full">
            <BarChart
              accessibilityLayer
              data={classStats}
              layout="vertical"
              margin={{
                right: 16,
                left: 16,
              }}
            >
              {/* <CartesianGrid horizontal={false} /> */}
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
              />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="value"
                layout="vertical"
                className="fill-vimmer-primary"
                radius={4}
              ></Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // Render GPS Map Chart
  if (chartType === "gpsMap") {
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
              {/* Simplified map background with grid lines */}
              <div className="w-full h-full grid grid-cols-10 grid-rows-10">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 border-opacity-30"
                  />
                ))}
              </div>

              {/* Position pins on the "map" */}
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

  // Default case, should not happen if chartType is properly set
  return null;
}
