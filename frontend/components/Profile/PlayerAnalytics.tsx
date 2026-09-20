"use client";
import { CategoryAnalytics } from "./ProfilePage";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 65, mobile: 28 },
  { month: "February", desktop: 95, mobile: 65 },
  { month: "March", desktop: 75, mobile: 40 },
  { month: "April", desktop: 25, mobile: 60 },
  { month: "May", desktop: 65, mobile: 45 },
  { month: "June", desktop: 70, mobile: 50 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--secondary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--accent)",
  },
} satisfies ChartConfig

export function ChartBarDemoLegend() {
  return (
    <ChartContainer 
      config={chartConfig} 
      className="min-h-[200px] max-h-[400px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper_*]:outline-none focus:outline-none"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 30,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        style={{ outline: "none" }}
      >
        <defs>
          <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={1} />
            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={1} />
            <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        <CartesianGrid 
          vertical={false} 
          horizontal={true} 
          strokeDasharray="3 3" 
          stroke="currentColor" 
          opacity={0.15} 
        />
        
        <YAxis 
          domain={[0, 100]} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}%`}
          width={45}
          className="text-muted-foreground text-xs font-medium"
        />
        
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={12}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          className="text-muted-foreground text-xs font-medium"
        />

        <ChartTooltip 
          cursor={{ fill: "currentColor", opacity: 0.05 }} 
          content={<ChartTooltipContent />} 
        />
        <ChartLegend content={<ChartLegendContent />} className="mt-4" />

        <Bar dataKey="desktop" fill="url(#colorDesktop)" radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey="desktop"
            position="top"
            offset={10}
            className="fill-foreground font-semibold"
            fontSize={12}
            formatter={(value) => `${value}%`}
          />
        </Bar>
        
        <Bar dataKey="mobile" fill="url(#colorMobile)" radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey="mobile"
            position="top"
            offset={10}
            className="fill-foreground font-semibold"
            fontSize={12}
            formatter={(value) => `${value}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}


export default function PlayerAnalytics({ analytics }: { analytics: CategoryAnalytics[] }) {
    return (
        <div className="min-h-[300px] w-full">
            <h2 className="text-lg font-semibold mb-4">Player Analytics</h2>
                <ChartBarDemoLegend />
        </div>
    );
}