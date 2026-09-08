"use client";

import {
  Minus,
  Plus,
  Settings,
  Users,
  Vote,
  Zap,
} from "lucide-react";

import type { RoomSettings } from "./RoomLobby";

type GameSettingsProps = {
  settings: RoomSettings;

  updateSetting: <K extends keyof RoomSettings>(
    key: K,
    value: RoomSettings[K]
  ) => void;
};

export default function GameSettings({
  settings,
  updateSetting,
}: GameSettingsProps) {
  return (
    <section
      className="
        rounded-[24px]
        border
        border-white/[0.08]
        bg-[#071126]/80
        p-5
        backdrop-blur-2xl
      "
    >

      {/* HEADER */}

      <div className="mb-5 flex items-center gap-3">

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-cyan-400/20
            bg-cyan-400/[0.08]
            text-cyan-300
          "
        >
          <Settings size={19} />
        </div>

        <div>

          <h2 className="font-semibold">
            Game Settings
          </h2>

          <p className="text-xs text-white/35">
            Customize your Trivia Trap game
          </p>

        </div>

      </div>

      <div className="space-y-3">

        {/* TOTAL ROUNDS */}

        <SettingCard
          icon={
            <span className="text-lg">
              ✦
            </span>
          }
          title="Total Rounds"
          description="How many rounds to play"
        >
          <Counter
            value={settings.total_rounds}
            onMinus={() =>
              updateSetting(
                "total_rounds",
                Math.max(
                  1,
                  settings.total_rounds - 1
                )
              )
            }
            onPlus={() =>
              updateSetting(
                "total_rounds",
                Math.min(
                  20,
                  settings.total_rounds + 1
                )
              )
            }
          />
        </SettingCard>

        {/* BLUFF TIME */}

        <SettingCard
          icon={<Zap size={19} />}
          title="Bluff Time"
          description="Time to create your bluff"
        >
          <Counter
            value={`${settings.bluff_time}s`}
            onMinus={() =>
              updateSetting(
                "bluff_time",
                Math.max(
                  10,
                  settings.bluff_time - 5
                )
              )
            }
            onPlus={() =>
              updateSetting(
                "bluff_time",
                Math.min(
                  60,
                  settings.bluff_time + 5
                )
              )
            }
          />
        </SettingCard>

        {/* VOTE TIME */}

        <SettingCard
          icon={<Vote size={19} />}
          title="Vote Time"
          description="Time to vote for the answer"
        >
          <Counter
            value={`${settings.vote_time}s`}
            onMinus={() =>
              updateSetting(
                "vote_time",
                Math.max(
                  10,
                  settings.vote_time - 5
                )
              )
            }
            onPlus={() =>
              updateSetting(
                "vote_time",
                Math.min(
                  60,
                  settings.vote_time + 5
                )
              )
            }
          />
        </SettingCard>

        {/* MAX PLAYERS */}

        <SettingCard
          icon={<Users size={19} />}
          title="Max Players"
          description="Maximum players in the room"
        >
          <Counter
            value={settings.max_players}
            onMinus={() =>
              updateSetting(
                "max_players",
                Math.max(
                  2,
                  settings.max_players - 1
                )
              )
            }
            onPlus={() =>
              updateSetting(
                "max_players",
                Math.min(
                  16,
                  settings.max_players + 1
                )
              )
            }
          />
        </SettingCard>

      </div>

      {/* DEFAULT INFO */}

      <div
        className="
          mt-4
          rounded-xl
          border
          border-purple-400/10
          bg-purple-500/[0.04]
          px-3
          py-2.5
          text-[10px]
          leading-4
          text-white/30
        "
      >
        <span className="text-purple-300">
          Default:
        </span>{" "}
        5 rounds · 30s bluff · 20s vote · 10 players
      </div>

    </section>
  );
}

/* ============================================================= */
/* SETTING CARD */
/* ============================================================= */

function SettingCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.025]
        p-3
      "
    >

      <div className="flex min-w-0 items-center gap-3">

        <div className="shrink-0 text-purple-300">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold text-white">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[9px] text-white/30">
            {description}
          </p>

        </div>

      </div>

      {children}

    </div>
  );
}

/* ============================================================= */
/* COUNTER */
/* ============================================================= */

function Counter({
  value,
  onMinus,
  onPlus,
}: {
  value: string | number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">

      <button
        type="button"
        onClick={onMinus}
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.04]
          text-white/50
          transition
          hover:bg-white/[0.08]
          hover:text-white
        "
        aria-label="Decrease"
      >
        <Minus size={13} />
      </button>

      <span
        className="
          flex
          w-11
          justify-center
          text-xs
          font-bold
          text-white
        "
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onPlus}
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.04]
          text-white/50
          transition
          hover:bg-white/[0.08]
          hover:text-white
        "
        aria-label="Increase"
      >
        <Plus size={13} />
      </button>

    </div>
  );
}