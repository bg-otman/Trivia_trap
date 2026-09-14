"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import RoomHeader from "./RoomHeader";
import PlayerList from "./PlayerList";
import GameSettings from "./GameSettings";
import CategorySelector from "./CategorySelector";
import ReadyBar from "./ReadyBar";
import RoomBackground from "./RoomBackground";
import RoomHero from "./RoomHero";
import RoomFooter from "./RoomFooter";

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

      <RoomBackground />

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

        <RoomHero
          roomCode={roomCode}
          copied={copied}
          onCopy={copyRoomCode}
          onInvite={invitePlayer}
        />

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

        <ReadyBar
          categoryCount={selectedCategories.length}
          totalRounds={settings.total_rounds}
          bluffTime={settings.bluff_time}
          voteTime={settings.vote_time}
          onStart={startGame}
        />

        <RoomFooter />

      </div>
    </main>
  );
}