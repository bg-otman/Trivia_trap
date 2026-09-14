"use client";

import { Crown, Plus, Users } from "lucide-react";

type PlayerListProps = {
  maxPlayers: number;
};

const players = [
  {
    name: "Qifrey",
    avatar: "👨🏾",
    host: true,
  },
];

export default function PlayerList({
  maxPlayers,
}: PlayerListProps) {
  const emptySlots = Math.max(
    0,
    maxPlayers - players.length
  );

  return (
    <section
      className="
        rounded-[24px]
        border
        border-white/[0.08]
        bg-[#071126]/80
        p-4
        shadow-[0_20px_60px_rgba(0,0,0,.25)]
        backdrop-blur-2xl
        sm:p-5
      "
    >

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

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
            <Users size={19} />
          </div>

          <div>

            <h2 className="text-sm font-semibold text-white sm:text-base">
              Players{" "}
              <span className="text-white/35">
                ({players.length}/{maxPlayers})
              </span>
            </h2>

            <p className="text-[10px] text-white/30 sm:text-xs">
              Invite your friends to play
            </p>

          </div>

        </div>

        <div className="hidden items-center gap-2 text-xs text-white/40 sm:flex">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

          Waiting for more players...

        </div>

      </div>

      {/* PLAYER GRID */}

      <div
        className="
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-10
        "
      >

        {/* CURRENT PLAYERS */}

        {players.map((player) => (
          <div
            key={player.name}
            className="
              group
              relative
              flex
              min-h-[125px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-purple-400/20
              bg-gradient-to-b
              from-purple-500/[0.09]
              to-transparent
              transition
              hover:border-purple-400/40
            "
          >

            {/* HOST BADGE */}

            {player.host && (
              <div
                className="
                  absolute
                  right-2
                  top-2
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-yellow-400/10
                  text-yellow-300
                "
              >
                <Crown
                  size={13}
                  fill="currentColor"
                />
              </div>
            )}

            {/* AVATAR */}

            <div
              className="
                relative
                flex
                h-14
                w-14
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border-2
                border-purple-400/50
                bg-[#101126]
                text-2xl
                shadow-[0_0_25px_rgba(168,85,247,.25)]
              "
            >
              {player.avatar}
            </div>

            <p className="mt-2 text-xs font-semibold text-white">
              {player.name}
            </p>

            <span className="mt-0.5 text-[9px] text-purple-300">
              Host
            </span>

          </div>
        ))}

        {/* EMPTY SLOTS */}

        {Array.from({ length: emptySlots }).map(
          (_, index) => (
            <button
              type="button"
              key={`empty-${index}`}
              className="
                group
                flex
                min-h-[125px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-white/[0.08]
                bg-white/[0.015]
                transition
                hover:border-purple-400/30
                hover:bg-purple-500/[0.04]
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-dashed
                  border-white/15
                  text-white/25
                  transition
                  group-hover:border-purple-400/40
                  group-hover:text-purple-300
                "
              >
                <Plus size={22} />
              </div>

              <span
                className="
                  mt-2
                  text-[11px]
                  text-white/30
                  transition
                  group-hover:text-white/60
                "
              >
                Invite
              </span>

            </button>
          )
        )}

      </div>
    </section>
  );
}