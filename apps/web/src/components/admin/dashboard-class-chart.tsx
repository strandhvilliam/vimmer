"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
} from "@vimmer/ui/components/chart";
import { useDomain } from "@/contexts/domain-context";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

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

export function DashboardClassChart() {
  const trpc = useTRPC();
  const { domain } = useDomain();
  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
  );
  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomain.queryOptions({ domain }),
  );

  const classStats = competitionClasses.map((cls) => ({
    name: cls.name,
    value: participants.filter((p) => p.competitionClassId === cls.id).length,
  }));

  const classConfig = classStats.reduce(
    (config, stat, index) => {
      config[stat.name] = {
        label: stat.name,
        color: COLORS[index % COLORS.length] || "#8884d8",
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>,
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
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
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
