"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";
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

const timeSeriesConfig = {
  count: {
    label: "Registrations",
    color: "#0088FE",
  },
};

export function DashboardTimeSeriesChart() {
  const { domain } = useDomain();
  const trpc = useTRPC();
  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomain.queryOptions({ domain }),
  );

  const participantsByDate = participants.reduce(
    (acc, p) => {
      const date = format(new Date(p.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const timeSeriesData = Object.entries(participantsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

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
        <ChartContainer config={timeSeriesConfig} className="h-[240px] w-full">
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
