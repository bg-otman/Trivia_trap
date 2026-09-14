"use client";

import { useState } from "react";
import { Copy, Dices, Share2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import RoomHeader from "./RoomHeader";
import RoomCode from "./RoomCode";
import PlayerList from "./PlayerList";
import GameSettings from "./GameSettings";
import CategorySelector from "./CategorySelector";

type RoomLobbyProps = {
  roomCode: string;
};

export type RoomSettings = {
  total_rounds: number;
  bluff_time: number;
  vote_time: number;
  max_players: number;
};

export default function RoomLobby({
  roomCode,
}: RoomLobbyProps) {
  const router = useRouter();

  /*
   * DEFAULT ROOM SETTINGS
   *
   * These values match your backend structure.
   */
  const [settings, setSettings] = useState<RoomSettings>({
    total_rounds: 5,
    bluff_time: 30,
    vote_time: 20,
    max_players: 10,
  });

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([
      "Geography",
      "Movies & TV",
      "Sports",
    ]);

  const [copied, setCopied] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  /*
   * Real player count would come from your backend/socket state.
   * Wired here so the header can show it without guessing.
   */
  const currentPlayerCount = 1;

  /*
   * UPDATE ONE SETTING
   */
  const updateSetting = <K extends keyof RoomSettings>(
    key: K,
    value: RoomSettings[K]
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /*
   * COPY ROOM CODE
   */
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      console.error("Unable to copy room code");
    }
  };

  /*
   * INVITE
   */
  const invitePlayer = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      console.error("Unable to copy invite link");
    }
  };

  /*
   * LEAVE ROOM
   */
  const leaveRoom = () => {
    router.push("/");
  };

  /*
   * START GAME
   */
  const startGame = () => {
    /*
     * This is exactly what you will eventually
     * send to your backend.
     */
    const gameData = {
      room_code: roomCode,

      data: {
        total_rounds: settings.total_rounds,
        bluff_time: settings.bluff_time,
        vote_time: settings.vote_time,
        max_players: settings.max_players,
      },

      categories: selectedCategories,
    };

    console.log("START GAME:", gameData);

    /*
     * Later, after backend/API:
     *
     * await fetch("/api/rooms/start", {
     *   method: "POST",
     *   headers: {
     *     "Content-Type": "application/json",
     *   },
     *   body: JSON.stringify(gameData),
     * });
     *
     * router.push(`/game/${roomCode}`);
     */

    router.push(`/game/${roomCode}`);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030616] text-white">

      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-[180px]
            top-[80px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-700/10
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -right-[180px]
            top-[160px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-cyan-500/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            bottom-[-200px]
            left-[30%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-fuchsia-600/10
            blur-[150px]
          "
        />

        {/* GRID */}
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,.025) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,.025) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* TOP GLOW */}
        <div
          className="
            absolute
            left-1/2
            top-0
            h-[350px]
            w-[800px]
            -translate-x-1/2
            rounded-full
            bg-purple-600/[0.05]
            blur-[100px]
          "
        />
      </div>

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <RoomHeader
        playerCount={currentPlayerCount}
        maxPlayers={settings.max_players}
        onBack={() => router.back()}
        onLeave={leaveRoom}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* ========================================================= */}
      {/* CONTENT */}
      {/* ========================================================= */}

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

        {/* ======================================================= */}
        {/* ROOM HERO */}
        {/* ======================================================= */}

        <section
          aria-labelledby="room-lobby-title"
          className="
            relative
            mb-5
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.09]
            bg-gradient-to-br
            from-[#091737]/90
            via-[#080d2a]/90
            to-[#16072c]/90
            px-5
            py-8
            shadow-[0_30px_100px_rgba(0,0,0,.35)]
            backdrop-blur-2xl
            sm:px-10
            sm:py-10
          "
        >

          {/* LEFT GLOW */}

          <div
            className="
              pointer-events-none
              absolute
              -left-20
              top-1/2
              h-60
              w-60
              -translate-y-1/2
              rounded-full
              bg-purple-600/15
              blur-[100px]
            "
          />

          {/* RIGHT GLOW */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              top-1/2
              h-60
              w-60
              -translate-y-1/2
              rounded-full
              bg-cyan-500/10
              blur-[100px]
            "
          />

          {/* CONTENT */}

          <div className="relative z-10 flex flex-col items-center text-center">

            {/* STATUS */}

            <div
              role="status"
              aria-live="polite"
              className="
                mb-3
                flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/[0.07]
                px-4
                py-1.5
                text-[10px]
                font-semibold
                tracking-[0.12em]
                text-cyan-300
                sm:text-[11px]
              "
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

              <span id="room-lobby-title">WAITING FOR PLAYERS</span>
            </div>

            <p className="text-sm text-white/40">
              Room Code
            </p>

            {/* ROOM CODE */}

            <RoomCode
              code={roomCode}
              copied={copied}
              onCopy={copyRoomCode}
            />

            <p id="room-code-help" className="mt-1 text-xs text-white/35">
              Tap the code to copy, or share the link below
            </p>

            {/* ACTIONS — Share is primary (fastest way to get a friend in), Invite is secondary */}

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={invitePlayer}
                aria-label="Copy invite link for this room"
                className="
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-5
                  text-sm
                  font-medium
                  text-white/80
                  backdrop-blur-xl
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.08]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-300
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#080d2a]
                "
              >
                <UserPlus size={15} />
                Copy Invite Link
              </button>

            </div>

          </div>
        </section>

        {/* ======================================================= */}
        {/* PLAYERS */}
        {/* ======================================================= */}

        <PlayerList maxPlayers={settings.max_players} />

        {/* ======================================================= */}
        {/* SETTINGS + CATEGORIES */}
        {/* ======================================================= */}

        <div
          className="
            mt-5
            grid
            gap-5
            lg:grid-cols-[0.9fr_1.4fr]
          "
        >

          {/* GAME SETTINGS */}

          <GameSettings
            settings={settings}
            updateSetting={updateSetting}
          />

          {/* CATEGORIES */}

          <CategorySelector
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

        </div>

        {/* ======================================================= */}
        {/* START GAME AREA */}
        {/* ======================================================= */}

        <section
          className="
    group relative mt-5 overflow-hidden
    rounded-[24px]
    border border-white/[0.08]
    bg-gradient-to-r
    from-[#080F25]/95
    via-[#0A102B]/95
    to-[#100A25]/95
    p-4
    shadow-[0_20px_70px_rgba(0,0,0,.25)]
    backdrop-blur-2xl
    sm:p-5
  "
        >
          {/* Ambient glow */}
          <div
            className="
      pointer-events-none absolute
      -right-20 -top-24
      h-56 w-56
      rounded-full
      bg-purple-500/[0.10]
      blur-[90px]
      transition-opacity duration-500
      group-hover:opacity-80
    "
          />

          <div
            className="
      pointer-events-none absolute
      -bottom-24 left-1/3
      h-40 w-40
      rounded-full
      bg-cyan-400/[0.06]
      blur-[80px]
    "
          />

          {/* Content */}
          <div
            className="
      relative z-10
      flex flex-col gap-4
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
          >
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
              {/* Status */}
              <div
                className="
          relative flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          border border-emerald-400/20
          bg-emerald-400/[0.07]
        "
              >
                <span
                  className="
            absolute h-2.5 w-2.5
            animate-pulse
            rounded-full
            bg-emerald-400
            shadow-[0_0_12px_rgba(52,211,153,.7)]
          "
                />

                <span
                  className="
            absolute h-5 w-5
            rounded-full
            border border-emerald-400/20
          "
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">
                    Ready to play?
                  </p>

                  <span
                    className="
              hidden rounded-full
              border border-emerald-400/20
              bg-emerald-400/[0.06]
              px-2 py-0.5
              text-[9px] font-medium
              uppercase tracking-wider
              text-emerald-300
              sm:block
            "
                  >
                    Host
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] text-white/35 sm:text-xs">
                    {selectedCategories.length} categories
                  </span>

                  <span className="text-white/15">•</span>

                  <span className="text-[10px] text-white/35 sm:text-xs">
                    {settings.total_rounds} rounds
                  </span>

                  <span className="text-white/15">•</span>

                  <span className="text-[10px] text-white/35 sm:text-xs">
                    {settings.bluff_time}s bluff
                  </span>

                  <span className="text-white/15">•</span>

                  <span className="text-[10px] text-white/35 sm:text-xs">
                    {settings.vote_time}s vote
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <button
              type="button"
              onClick={startGame}
              className="
    group/start relative
    flex h-[56px] w-full shrink-0
    items-center justify-center
    gap-3
    overflow-hidden
    rounded-2xl
    border border-white/20
    bg-[linear-gradient(135deg,#FF4F81_0%,#7047F5_52%,#19D9ED_100%)]
    px-7
    text-[14px] font-bold tracking-[-0.01em] text-white
    shadow-[0_10px_35px_rgba(112,71,245,.30),inset_0_1px_0_rgba(255,255,255,.25)]
    transition-all duration-300
    hover:-translate-y-0.5
    hover:scale-[1.015]
    hover:shadow-[0_14px_45px_rgba(112,71,245,.48),0_0_25px_rgba(25,217,237,.16),inset_0_1px_0_rgba(255,255,255,.3)]
    active:translate-y-0
    active:scale-[0.985]
    disabled:pointer-events-none
    disabled:opacity-50
    sm:w-auto
    sm:min-w-[220px]
  "
            >
              {/* Animated shine */}
              <span
                className="
      pointer-events-none absolute inset-0
      -translate-x-[130%]
      skew-x-[-18deg]
      bg-gradient-to-r
      from-transparent
      via-white/25
      to-transparent
      transition-transform
      duration-700
      ease-out
      group-hover/start:translate-x-[130%]
    "
              />

              {/* Soft inner glow */}
              <span
                className="
      pointer-events-none absolute inset-[1px]
      rounded-[15px]
      border border-white/[0.14]
      bg-gradient-to-b
      from-white/[0.08]
      to-transparent
    "
              />

              {/* Bottom energy glow */}
              <span
                className="
      pointer-events-none absolute
      -bottom-8 left-1/2
      h-12 w-3/4
      -translate-x-1/2
      rounded-full
      bg-white/20
      blur-2xl
      opacity-0
      transition-opacity
      duration-300
      group-hover/start:opacity-100
    "
              />

              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span
                  className="
        flex h-8 w-8
        items-center justify-center
        rounded-full
        border border-white/25
        bg-black/10
        text-[10px]
        shadow-[inset_0_1px_0_rgba(255,255,255,.15)]
        backdrop-blur-sm
        transition-all duration-300
        group-hover/start:scale-110
        group-hover/start:bg-white/15
      "
                >
                  <span className="ml-[1px]">▶</span>
                </span>

                <span className="whitespace-nowrap">
                  Start Game
                </span>

                <span
                  className="
        text-[16px] font-light
        opacity-50
        transition-all duration-300
        group-hover/start:translate-x-1
        group-hover/start:opacity-100
      "
                >
                  →
                </span>
              </span>
            </button>
          </div>
        </section>

        {/* ======================================================= */}
        {/* FOOTER */}
        {/* ======================================================= */}

        <footer
          className="
            mt-7
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-white/[0.06]
            pt-5
            text-xs
            text-white/30
            sm:flex-row
          "
        >

          <div className="flex items-center gap-2">

            <Link href="/" className="group flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trap-pink via-trap-purple to-trap-cyan shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
                <Dices size={18} className="text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                TRIVIA <span className="text-gradient-pink-purple">TRAP</span>
              </span>
            </Link>

            <span>
              Play. Bluff. Outsmart. Together.
            </span>

          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">

            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Room created just now
            </span>

            <span>
              v1.0.0
            </span>

          </div>

        </footer>

      </div>
    </main>
  );
}