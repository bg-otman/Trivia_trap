import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryAnalytics } from "@/types/userData";

export function GamePerformance({ analytics }: { analytics: CategoryAnalytics[] }) {
  return (
    <section aria-labelledby="performance-title" className="flex flex-col">
      <h2 id="performance-title" className="mb-3 font-secondary text-base uppercase text-white">Game performance</h2>
      <Card className="flex-1 rounded-[20px] border border-white/[0.07] bg-trap-surface">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm font-extrabold">Category performance</CardTitle>
          <BarChart3 className="size-4 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#85858f]">Game performance will appear here after matches are played.</p>
          ) : analytics.map((item) => (
            <div key={item.category} className="rounded-xl border border-white/[0.06] bg-black/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-xs font-extrabold text-white">{item.category}</h3>
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#777782]">{item.total_rounds} rounds</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3">
                <div><dt className="text-[8px] font-black uppercase tracking-wider text-[#777782]">Knowledge</dt><dd className="mt-1 font-secondary text-lg text-trap-success">{item.knowledge_accuracy.toFixed(1)}%</dd></div>
                <div><dt className="text-[8px] font-black uppercase tracking-wider text-[#777782]">Bluff efficiency</dt><dd className="mt-1 font-secondary text-lg text-accent">{item.bluff_efficiency.toFixed(1)}%</dd></div>
              </dl>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
