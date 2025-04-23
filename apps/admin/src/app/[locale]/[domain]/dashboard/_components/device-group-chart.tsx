"use client";

import { Cell, Pie, PieChart, LabelList } from "recharts";
import {
  Card,
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
import { useDashboardData } from "../dashboard-context";
import { use } from "react";

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

export function DeviceGroupChart() {
  const { deviceGroupsPromise, participantsPromise } = useDashboardData();
  const deviceGroups = use(deviceGroupsPromise);
  const participants = use(participantsPromise);

  const deviceGroupStats = deviceGroups.map((group) => ({
    name: group.name,
    value: participants.filter((p) => p.deviceGroupId === group.id).length,
  }));

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
