import { CalendarDays, Gamepad2, Pencil, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/types/userData";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileBanner } from "./profile-banner";

export function ProfileHeader({
  user,
  onEdit,
  isOwner,
}: {
  user: UserData;
  onEdit: () => void;
  isOwner: boolean;
}) {
  const joinedDate = user.join_date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <header className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-trap-surface p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18)] sm:p-6">
      <ProfileBanner src={user.banner} />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-28 size-72 rounded-full bg-primary/[0.06] blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <span className="relative transition-transform duration-300 hover:scale-[1.03]">
          <ProfileAvatar
            name={user.username}
            imageUrl={user.avatar}
            size={96}
          />
          {isOwner ? (
            <span
              className="absolute bottom-1 right-1 size-4 rounded-full bg-trap-success ring-[3px] ring-trap-surface"
              aria-label="Online"
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <h1 className="font-secondary text-3xl uppercase tracking-[-0.03em] text-white">
              {user.username}
            </h1>
            {isOwner ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trap-success/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-trap-success">
                <span className="size-1.5 rounded-full bg-current" /> Online
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-semibold text-[#9295ff]">
            @{user.username}
          </p>
          <p className="mt-2 text-sm text-[#a6a6ae]">Trivia Trap player</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7f7f89] sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" /> Joined{" "}
              {joinedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gamepad2 className="size-3.5 text-[#9295ff]" />{" "}
              {user.stats.total_games} Games
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="size-3.5 text-accent" />{" "}
              {user.stats.total_wins} Wins
            </span>
          </div>
        </div>
        {isOwner ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full text-[10px] sm:w-auto"
          >
            <Pencil className="size-3.5" /> Update avatar
          </Button>
        ) : null}
      </div>
    </header>
  );
}
