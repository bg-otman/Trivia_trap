"use client";
import { CategoryAnalytics } from "@/types/userData";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  knowledge_accuracy: {
    label: "Knowledge Accuracy",
    color: "var(--secondary)",
  },
  bluff_efficiency: {
    label: "Bluff Efficiency",
    color: "var(--accent)",
  },
} satisfies ChartConfig

export function ChartBarDemoLegend({ chartData }: { chartData: CategoryAnalytics[] }) {
  // when the chartData is empty, we will show a placeholder chart with 1 bar for each metric
  if (chartData.length === 0) {
    chartData = [
      { category: "No Data", total_rounds: 0, knowledge_accuracy: 0, bluff_efficiency: 0 },
    ];
  }
  return (
    <ChartContainer 
      config={chartConfig}
      className="min-h-[300px] max-h-[500px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper_*]:outline-none focus:outline-none"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorKnowledge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-knowledge_accuracy)" stopOpacity={1} />
            <stop offset="95%" stopColor="var(--color-knowledge_accuracy)" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="colorBluff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-bluff_efficiency)" stopOpacity={1} />
            <stop offset="95%" stopColor="var(--color-bluff_efficiency)" stopOpacity={0.4} />
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
          width={45}
          className="text-muted-foreground text-xs font-medium"
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12, fill: "var(--color-foreground)", fontWeight: 800 }}
        />
        
        {/* Bottom XAxis for the Category names */}
        <XAxis
          xAxisId="bottom"
          dataKey="category"
          tickLine={false}
          tickMargin={16}
          interval={0}
          minTickGap={0}
          angle={-35}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10, fill: "var(--color-foreground)", fontWeight: 800 }}
          tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
        />

        <ChartTooltip
          cursor={{ fill: "currentColor", opacity: 0.06 }}
          content={
            <ChartTooltipContent
              formatter={(value, name) => `${name}: ${value?.toLocaleString()}%`}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload;
                if (!row) return "";

                const rounds = row.total_rounds;
                return rounds != null
                  ? `${row.category} • ${rounds} rounds`
                  : row.category;
              }}
            />
          }
        />

        <ChartLegend
        glyphName={"category"}
        className="m-2"
        content={(props: any) => (
          <ChartLegendContent 
            {...props} 
            payload={[
              { value: "knowledge_accuracy", type: "square", color: "var(--secondary)" },
              { value: "bluff_efficiency", type: "square", color: "var(--accent)" }
            ]}
          />
        )} 
      />

        <Bar xAxisId="bottom" dataKey="knowledge_accuracy" fill="url(#colorKnowledge)" radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey="knowledge_accuracy"
            position="top"
            offset={10}
            className="fill-foreground font-semibold"
            fontSize={12}
            formatter={(value) => `${value}%`}
          />
        </Bar>
        
        <Bar xAxisId="bottom" dataKey="bluff_efficiency" fill="url(#colorBluff)" radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey="bluff_efficiency"
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
        <div className="min-h-[300px] w-full border-2 rounded-lg border-[var(--secondary)] p-4">
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <h2 className="text-lg font-bold font-blackops">📈 Player Analytics</h2>
              <p className="text-center border rounded-xl border-[var(--primary)/10] px-2 py-1 text-xs font-semibold text-[var(--accent)]">
                Category Mastery: Knowledge vs Bluff Efficiency
              </p>
            </div>
            <ChartBarDemoLegend chartData={analytics} />
        </div>
    );
}
