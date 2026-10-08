import { Award, Gamepad2, Trophy, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/mocks/dashboard";

const icons = {
  win: Trophy,
  friend: UserPlus,
  achievement: Award,
  game: Gamepad2,
};

export function RecentActivity() {
  return (
    <Card className="rounded-[20px] border border-white/[0.07] bg-trap-surface shadow-[0_18px_42px_rgba(0,0,0,0.16)]">
      <CardHeader className="border-b border-white/[0.06] pb-4">
        <CardTitle className="font-secondary text-base uppercase">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-px px-0 md:grid-cols-2 xl:grid-cols-4">
        {recentActivity.map((activity, index) => {
          const Icon = icons[activity.kind];
          return (
            <div key={index} className="flex min-w-0 items-center gap-3 border-white/[0.055] px-4 py-3.5 md:odd:border-r xl:border-r xl:last:border-r-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.045] text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-[#d8d8dd]">{activity.text}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#696974]">{activity.detail}</p>
              </div>
              <span className="text-[9px] text-[#696974]">{activity.time}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
